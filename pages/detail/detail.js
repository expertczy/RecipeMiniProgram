Page({
  data: {
    dish: null
  },

  onLoad(options) {
    const dishes = wx.getStorageSync('dishes') || []
    const dish = dishes.find(d => d.id === options.id)
    this.setData({ dish })
  },

  onIngredientsChange(e) {
    this.setData({
      'dish.ingredients': e.detail.value
    })
  },

  onStepsChange(e) {
    this.setData({
      'dish.steps': e.detail.value
    })
  },

  saveDish() {
    const dishes = wx.getStorageSync('dishes') || []
    const index = dishes.findIndex(d => d.id === this.data.dish.id)
    
    if (index > -1) {
      dishes[index] = this.data.dish
      wx.setStorageSync('dishes', dishes)
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      })
    }
  },

  deleteDish() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道菜吗？',
      success: (res) => {
        if (res.confirm) {
          const dishes = wx.getStorageSync('dishes') || []
          const updatedDishes = dishes.filter(d => d.id !== this.data.dish.id)
          wx.setStorageSync('dishes', updatedDishes)
          
          wx.showToast({
            title: '已删除',
            icon: 'success',
            duration: 1500
          })
          
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  }
}) 