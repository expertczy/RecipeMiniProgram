import { api } from '../../utils/api.js'

Page({
  data: {
    dish: null,
    isLoading: false,
    isEditingName: false,
    hasUnsavedChanges: false
  },

  onLoad(options) {
    console.log('Detail page loaded with options:', options);
    
    if (options.id) {
      this.setData({
        dishId: options.id
      });
      this.loadDish(options.id);
    } else {
      // 新建菜品
      this.setData({
        dish: {
          name: '',
          type: 'meat',
          ingredients: '',
          image: '/images/Ricky.jpg'
        },
        isNewDish: true
      });
    }
  },

  // 页面卸载前触发
  onUnload() {
    // 如果有未保存的修改，记录日志
    if (this.data.hasUnsavedChanges) {
      console.log('页面卸载时有未保存的修改');
    }
  },

  // 设置未保存修改状态
  setUnsavedChanges(hasChanges) {
    this.setData({ hasUnsavedChanges: hasChanges });
    
    if (hasChanges) {
      // 启用返回拦截
      wx.enableAlertBeforeUnload({
        message: '您有未保存的修改，确定要离开吗？',
        success: (res) => {
          console.log('启用返回拦截成功', res);
        },
        fail: (err) => {
          console.error('启用返回拦截失败', err);
        }
      });
    } else {
      // 关闭返回拦截
      wx.disableAlertBeforeUnload({
        success: (res) => {
          console.log('关闭返回拦截成功', res);
        },
        fail: (err) => {
          console.error('关闭返回拦截失败', err);
        }
      });
    }
  },

  async loadDish(id) {
    this.setData({ isLoading: true })
    try {
      const dishes = await api.getDishes()
      const dish = dishes.find(d => d.id === id)
      
      console.log('Loaded dish:', dish);
      
      if (!dish) {
        throw new Error('菜品不存在')
      }

      // Ensure dish has a type property, default to 'meat' if not set
      if (!dish.type) {
        dish.type = 'meat'
      }
      
      // Ensure image path is correct
      if (dish.image) {
        // Make sure image path starts with /images/
        if (!dish.image.startsWith('/images/')) {
          if (dish.image.includes('EXPERT')) {
            dish.image = '/images/EXPERT.jpg';
          } else if (dish.image.includes('etc')) {
            dish.image = '/images/etc.png';
          } else {
            dish.image = '/images/Ricky.jpg';
          }
        }
      } else {
        // Default to Ricky if no image
        dish.image = '/images/Ricky.jpg';
      }
      
      console.log('Processed dish with image:', dish.image);

      this.setData({ 
        dish,
        isLoading: false
      })
    } catch (error) {
      console.error('Error loading dish:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      })
      this.setData({ isLoading: false })
    }
  },

  onIngredientsChange(e) {
    const dish = { ...this.data.dish }
    dish.ingredients = e.detail.value
    this.setData({ dish });
    this.setUnsavedChanges(true);
  },

  toggleNameEdit() {
    this.setData({
      isEditingName: !this.data.isEditingName
    })
  },

  onNameChange(e) {
    const dish = { ...this.data.dish }
    dish.name = e.detail.value
    this.setData({ dish });
    this.setUnsavedChanges(true);
  },

  onTypeSelect(e) {
    const type = e.currentTarget.dataset.type;
    const updatedData = { ...this.data.dish };
    updatedData.type = type;
    
    this.setData({ dish: updatedData });
    this.setUnsavedChanges(true);
  },

  onSourceSelect(e) {
    const source = e.currentTarget.dataset.source;
    const dish = { ...this.data.dish };
    
    console.log('Source selected:', source);
    console.log('Original dish image:', dish.image);
    
    // Set the image based on the selected source
    if (source === 'expert') {
      dish.image = '/images/EXPERT.jpg';
    } else if (source === 'pending') {
      dish.image = '/images/etc.png';
    } else {
      dish.image = '/images/Ricky.jpg';
    }
    
    console.log('New dish image:', dish.image);
    this.setData({ dish });
    this.setUnsavedChanges(true);
  },

  async saveDish() {
    if (!this.data.dish || !this.data.dish.id) {
      wx.showToast({
        title: '无效的菜品数据',
        icon: 'error'
      })
      return
    }

    this.setData({ isLoading: true })
    try {
      console.log('Saving dish with image:', this.data.dish.image);
      
      // Create update payload
      const updatePayload = {
        name: this.data.dish.name,
        ingredients: this.data.dish.ingredients,
        image: this.data.dish.image,
        type: this.data.dish.type
      }
      
      console.log('Update payload:', updatePayload);

      await api.updateDish(this.data.dish.id, updatePayload)

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 退出菜名编辑状态并重置未保存标志
      this.setData({ 
        isLoading: false,
        isEditingName: false
      })
      this.setUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving dish:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
      this.setData({ isLoading: false })
    }
  },

  async deleteDish() {
    if (!this.data.dish || !this.data.dish.id) {
      wx.showToast({
        title: '无效的菜品数据',
        icon: 'error'
      })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道菜吗？',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ 
            isLoading: true,
            isEditingName: false // 退出编辑状态
          })
          try {
            console.log('Deleting dish with ID:', this.data.dish.id)
            await api.deleteDish(this.data.dish.id)

            // 删除成功后重置未保存标志
            this.setUnsavedChanges(false);

            wx.showToast({
              title: '已删除',
              icon: 'success'
            })

            // Wait for the toast to show before navigating back
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          } catch (error) {
            console.error('Error deleting dish:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          } finally {
            this.setData({ isLoading: false })
          }
        }
      }
    })
  },

  // 添加返回按钮拦截
  onBackPress(e) {
    // 系统已经通过enableAlertBeforeUnload处理了确认对话框
    // 这里只需要决定是否阻止默认的返回行为
    return this.data.hasUnsavedChanges; // 如果有未保存的修改，阻止默认的返回行为
  },

  // 自定义导航栏返回按钮事件
  onBeforeBack() {
    // 如果没有未保存的修改，直接返回
    if (!this.data.hasUnsavedChanges) {
      wx.navigateBack();
    }
    // 如果有未保存的修改，系统会通过enableAlertBeforeUnload显示确认对话框
    // 用户确认后会自动返回，不需要在这里处理
  },
}) 