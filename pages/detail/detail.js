import { api } from '../../utils/api.js'

Page({
  data: {
    dish: null,
    secondDish: null,
    isLoading: false
  },

  async onLoad(options) {
    if (!options.id) {
      wx.showToast({
        title: '菜品ID无效',
        icon: 'error'
      })
      return
    }

    // Load both dishes if secondId is provided
    await Promise.all([
      this.loadDish(options.id, 'dish'),
      options.secondId ? this.loadDish(options.secondId, 'secondDish') : Promise.resolve()
    ])
  },

  async loadDish(id, targetField = 'dish') {
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

      // Use dynamic field name to update either dish or secondDish
      this.setData({ 
        [targetField]: dish,
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
    this.setData({ dish })
  },

  onTypeSelect(e) {
    const type = e.currentTarget.dataset.type;
    const target = e.currentTarget.dataset.target || 'dish';
    
    const updatedData = { ...this.data[target] };
    updatedData.type = type;
    
    this.setData({ 
      [target]: updatedData 
    });
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

      // Don't reload the dish as the server doesn't properly update the image
      // Keep the local changes instead
      this.setData({ isLoading: false })
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
          this.setData({ isLoading: true })
          try {
            console.log('Deleting dish with ID:', this.data.dish.id)
            await api.deleteDish(this.data.dish.id)

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
  }
}) 