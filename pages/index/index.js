// index.js

import { api } from '../../utils/api.js'

Page({
  data: {
    newDishName: '',
    selectedImage: '',
    dishes: [],
    isLoading: false
  },

  async loadDishes() {
    this.setData({ isLoading: true })
    
    // First load from local storage to show something immediately
    const localDishes = wx.getStorageSync('dishes') || []
    this.setData({ dishes: localDishes })

    try {
      console.log('Fetching dishes from API...')
      const apiDishes = await api.getDishes()
      console.log('API dishes received:', apiDishes)

      if (Array.isArray(apiDishes) && apiDishes.length > 0) {
        // Sort dishes by createdAt in descending order (newest first)
        const sortedDishes = apiDishes.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )

        console.log('Sorted dishes:', sortedDishes)

        // Update both state and local storage
        this.setData({ dishes: sortedDishes })
        wx.setStorageSync('dishes', sortedDishes)
      }
    } catch (error) {
      console.error('Error loading dishes from API:', error)
      
      if (!localDishes.length) {
        wx.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    } finally {
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
        image: "https://example.com/default.jpg",  // Using a URL instead of local path
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
