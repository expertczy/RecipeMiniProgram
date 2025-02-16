// index.js

import { api } from '../../utils/api.js'

Page({
  data: {
    newDishName: '',
    selectedImage: '',
    dishes: [],
    isLoading: false,
    useExpertImage: false  // New flag to track which image to use
  },

  async loadDishes() {
    this.setData({ isLoading: true })
    try {
      const dishes = await api.getDishes()
      this.setData({ 
        dishes,
        isLoading: false 
      })
    } catch (error) {
      console.error('Error loading dishes:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ isLoading: false })
    }
  },

  onLoad() {
    this.loadDishes()
  },

  onShow() {
    this.loadDishes()
  },

  onPullDownRefresh() {
    this.loadDishes().then(() => {
      wx.stopPullDownRefresh()
    })
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

  toggleImage() {
    wx.showActionSheet({
      itemList: ['Ricky', '砖家'],
      success: (res) => {
        this.setData({
          useExpertImage: res.tapIndex === 1  // 0 for Ricky, 1 for Expert
        })
      },
      fail: (res) => {
        console.log(res.errMsg)
      }
    })
  },

  async addDishWithApi() {
    if (!this.data.newDishName.trim()) {
      wx.showToast({
        title: '请输入菜品名称',
        icon: 'none'
      })
      return
    }

    this.setData({ isLoading: true })

    try {
      const newDish = {
        name: this.data.newDishName.trim(),
        image: this.data.useExpertImage ? '/images/EXPERT.jpg' : '/images/Ricky.jpg',
        ingredients: "",
        steps: ""
      }

      console.log('Sending dish data:', newDish)
      const result = await api.addDish(newDish)
      
      await this.loadDishes()
      
      this.setData({
        newDishName: '',
        selectedImage: ''
      })

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('Error details:', error)
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
})
