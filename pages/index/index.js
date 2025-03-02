// index.js

import { api } from '../../utils/api.js'

Page({
  data: {
    newDishName: '',
    selectedImage: '',
    dishes: [],
    isLoading: false,
    useExpertImage: false,  // New flag to track which image to use
    searchText: '',
    showTypeFilter: false,
    selectedType: '',
    filteredDishes: [],  // Initialize empty
    newDishType: '',
    isAddingDish: false,
  },

  async loadDishes() {
    this.setData({ isLoading: true })
    try {
      const dishes = await api.getDishes()
      this.setData({ 
        dishes,
        filteredDishes: dishes  // Initialize with all dishes
      })
    } catch (error) {
      console.error('Failed to load dishes:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
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
        type: this.data.newDishType || "",  // Include the selected type
      }

      const result = await api.addDish(newDish)
      console.log('Added dish:', result)

      this.setData({
        newDishName: '',
        newDishType: '',  // Reset the type after successful add
        isLoading: false
      })

      this.loadDishes()

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('Failed to add dish:', error)
      this.setData({ isLoading: false })
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      })
    }
  },

  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  onSearchInput(e) {
    const searchText = e.detail.value
    this.setData({ searchText })
    this.filterDishes()
  },

  showTypeFilter() {
    this.setData({ showTypeFilter: true })
  },

  hideTypeFilter() {
    this.setData({ showTypeFilter: false })
  },

  stopPropagation(e) {
    // Prevent popup from closing when clicking inside
    e.stopPropagation();
  },

  showTypeFilterForAdd() {
    this.setData({ 
      showTypeFilter: true,
      isAddingDish: true
    })
  },

  onTypeSelect(e) {
    const type = e.currentTarget.dataset.type
    if (this.data.isAddingDish) {
      this.setData({ 
        newDishType: type,
        showTypeFilter: false,
        isAddingDish: false
      })
    } else {
      this.setData({ 
        selectedType: type,
        showTypeFilter: false 
      })
      this.filterDishes()
    }
  },

  filterDishes() {
    let filtered = [...this.data.dishes]
    
    // Filter by search text
    if (this.data.searchText) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(this.data.searchText.toLowerCase())
      )
    }

    // Filter by type
    if (this.data.selectedType) {
      filtered = filtered.filter(dish => dish.type === this.data.selectedType)
    }

    this.setData({ filteredDishes: filtered })
  },

  async surpriseMe() {
    const dishes = this.data.dishes
    if (dishes.length === 0) return
    
    // Filter dishes by type
    const meatAndDrinkDishes = dishes.filter(dish => 
      ['beef', 'chicken', 'pork', 'sheep', 'drink'].includes(dish.type)
    )
    const vegDishes = dishes.filter(dish => 
      dish.type === 'vegetable'
    )

    // Check if we have enough dishes of each type
    if (meatAndDrinkDishes.length === 0 || vegDishes.length === 0) {
      wx.showToast({
        title: '菜品不足',
        icon: 'error'
      })
      return
    }

    // Select random dishes from each category
    const randomMeatDrink = meatAndDrinkDishes[Math.floor(Math.random() * meatAndDrinkDishes.length)]
    const randomVeg = vegDishes[Math.floor(Math.random() * vegDishes.length)]

    // Update the filtered dishes to show only these two selections
    this.setData({
      filteredDishes: [randomMeatDrink, randomVeg]
    })
  },

  resetDishes() {
    this.setData({
      filteredDishes: this.data.dishes
    })
  }
})
