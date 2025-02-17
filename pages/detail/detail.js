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
      
      if (!dish) {
        throw new Error('菜品不存在')
      }

      // Ensure dish has a type property, default to 'meat' if not set
      if (!dish.type) {
        dish.type = 'meat'
      }

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

  onStepsChange(e) {
    const dish = { ...this.data.dish }
    dish.steps = e.detail.value
    this.setData({ dish })
  },

  onTypeSelect(e) {
    const dish = { ...this.data.dish }
    dish.type = e.currentTarget.dataset.type
    this.setData({ dish })
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
      console.log('Updating dish:', this.data.dish)
      
      // Create update payload
      const updatePayload = {
        name: this.data.dish.name,
        ingredients: this.data.dish.ingredients,
        steps: this.data.dish.steps,
        image: this.data.dish.image,
        type: this.data.dish.type
      }

      await api.updateDish(this.data.dish.id, updatePayload)

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // Reload the dish to get the latest data
      await this.loadDish(this.data.dish.id)
    } catch (error) {
      console.error('Error saving dish:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
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