// index.js
import { api } from '../../utils/api'

Page({
  data: {
    newDishName: '',
    selectedImage: '',
    dishes: []
  },

  onLoad() {
    this.loadDishes()
  },

  onShow() {
    this.loadDishes()
  },

  loadDishes() {
    const dishes = wx.getStorageSync('dishes') || []
    this.setData({ dishes })
  },

  onInputChange(e) {
    this.setData({
      newDishName: e.detail.value
    })
  },

  selectImage() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        this.setData({
          selectedImage: res.tempFilePaths[0]
        })
      }
    })
  },

  addDish() {
    if (!this.data.newDishName.trim()) {
      wx.showToast({
        title: '请输入菜品名称',
        icon: 'none'
      })
      return
    }

    const dishes = wx.getStorageSync('dishes') || []
    const newDish = {
      id: Date.now().toString(), // Generate a unique ID
      name: this.data.newDishName,
      image: this.data.selectedImage || '/images/Ricky.jpg'
    }

    dishes.push(newDish)
    wx.setStorageSync('dishes', dishes)
    
    this.setData({
      dishes,
      newDishName: '',
      selectedImage: ''
    })

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  async deleteDish(e) {
    const { id } = e.currentTarget.dataset
    try {
      await api.deleteDish(id)
      await this.loadDishes()
      wx.showToast({
        title: '已删除',
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
})
