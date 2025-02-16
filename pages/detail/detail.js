import { api } from '../../utils/api'

Page({
  data: {
    dish: null
  },

  async onLoad(options) {
    try {
      const dishes = await api.getDishes()
      const dish = dishes.find(d => d.id === options.id)
      this.setData({ dish })
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
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

  async saveDish() {
    try {
      await api.updateDish(this.data.dish.id, this.data.dish)
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      })
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  async deleteDish() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道菜吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteDish(this.data.dish.id)
            wx.showToast({
              title: '已删除',
              icon: 'success',
              duration: 1500
            })
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          } catch (error) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
}) 