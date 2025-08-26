// index.js

import { api } from '../../utils/api.js'

Page({
  data: {
    selectedImage: '',
    dishes: [],
    isLoading: false,
    useExpertImage: false,  // New flag to track which image to use
    searchText: '',
    showTypeFilterPopup: false,
    selectedType: '',
    tempSelectedType: '', // Temporary storage for type selection
    userFilter: 'all', // 'all', 'ricky', 'expert', or 'pending'
    tempUserFilter: 'all', // Temporary storage for user filter selection
    filteredDishes: [],  // Initialize empty
    isAddingDish: false,
    allDishes: [], // Store all dishes before filtering
    tempDishName: '', // Temporary storage for dish name when adding
    groupedDishes: {}, // Store dishes grouped by type
    dishTypes: [], // Store all available dish types
    expandedTypes: {}, // Track which type categories are expanded
    pendingDishes: [], // Store pending dishes
  },

  async loadDishes() {
    this.setData({ isLoading: true })
    try {
      const dishes = await api.getDishes()
      this.setData({ 
        allDishes: dishes,
        dishes: dishes
      })
      this.filterDishes()
      this.groupDishesByType()
      this.extractPendingDishes()
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

  // Group dishes by their type
  groupDishesByType() {
    const grouped = {};
    const types = [];
    
    // First filter out pending dishes from the regular grouping
    const nonPendingDishes = this.data.filteredDishes.filter(dish => 
      dish.image !== '/images/etc.png'
    );
    
    // First collect all available types
    nonPendingDishes.forEach(dish => {
      if (dish.type && !types.includes(dish.type)) {
        types.push(dish.type);
      }
    });
    
    // Group dishes by type
    types.forEach(type => {
      grouped[type] = nonPendingDishes.filter(dish => dish.type === type);
    });
    
    // Add dishes without type at the end
    const noTypeItems = nonPendingDishes.filter(dish => !dish.type);
    if (noTypeItems.length > 0) {
      grouped['other'] = noTypeItems;
      if (!types.includes('other')) {
        types.push('other');
      }
    }
    
    // Custom order with specific requirements:
    // 1. drink first (after pending)
    // 2. beef and other meat types
    // 3. seafood
    // 4. vegetable near the end (before main)
    // 5. main at the very end
    const customOrder = [];
    
    // First add drink if it exists
    if (types.includes('drink')) {
      customOrder.push('drink');
    }
    
    // Add beef if it exists
    if (types.includes('beef')) {
      customOrder.push('beef');
    }
    
    // Add all other meat types except seafood
    types.forEach(type => {
      if (type !== 'drink' && type !== 'beef' && type !== 'seafood' && 
          type !== 'vegetable' && type !== 'main' && type !== 'other') {
        customOrder.push(type);
      }
    });
    
    // Add seafood if it exists
    if (types.includes('seafood')) {
      customOrder.push('seafood');
    }
    
    // Add main if it exists
    if (types.includes('main')) {
      customOrder.push('main');
    }
    
    // Add vegetable near the end if it exists
    if (types.includes('vegetable')) {
      customOrder.push('vegetable');
    }
    
    // Add other at the very end if it exists
    if (types.includes('other')) {
      customOrder.push('other');
    }
    
    this.setData({
      groupedDishes: grouped,
      dishTypes: customOrder
    })
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
    this.setData({ 
      showTypeFilterPopup: true,
      tempSelectedType: this.data.selectedType,
      tempUserFilter: this.data.userFilter,
      tempDishName: '', // Reset the dish name when opening the filter
      isAddingDish: false // Make sure we're not in adding mode
    })
  },

  hideTypeFilter() {
    this.setData({ showTypeFilterPopup: false })
  },

  stopPropagation(e) {
    // This function is used with catchtap to prevent event bubbling
    // No need to call e.stopPropagation() as catchtap already does this
    return;
  },

  showTypeFilterForAdd() {
    this.setData({ 
      showTypeFilterPopup: true,
      isAddingDish: true
    })
  },

  onTypeSelect(e) {
    const type = e.currentTarget.dataset.type
    if (this.data.isAddingDish) {
      this.setData({ 
        tempSelectedType: type // Just update the tempSelectedType, don't close the popup
      })
    } else {
      this.setData({ 
        tempSelectedType: type
      })
    }
  },

  selectUserFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ 
      tempUserFilter: filter
    });
  },

  applyFilters() {
    if (this.data.isAddingDish) {
      this.setData({
        newDishType: this.data.tempSelectedType,
        useExpertImage: this.data.tempUserFilter === 'expert',
        showTypeFilterPopup: false,
        isAddingDish: false
      });
    } else {
      this.setData({
        selectedType: this.data.tempSelectedType,
        userFilter: this.data.tempUserFilter,
        showTypeFilterPopup: false
      });
      this.filterDishes();
    }
  },

  resetFilters() {
    if (this.data.isAddingDish) {
      // Don't reset filters when adding a dish
      return;
    }
    
    this.setData({
      tempSelectedType: '',
      tempUserFilter: 'all'
    });
  },

  cancelFilters() {
    this.setData({
      showTypeFilterPopup: false
    });
  },

  filterDishes() {
    let filtered = [...this.data.allDishes]
    
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

    // Filter by user filter
    if (this.data.userFilter === 'expert') {
      filtered = filtered.filter(dish => dish.image === '/images/EXPERT.jpg')
    } else if (this.data.userFilter === 'ricky') {
      filtered = filtered.filter(dish => dish.image === '/images/Ricky.jpg')
    } else if (this.data.userFilter === 'pending') {
      filtered = filtered.filter(dish => dish.image === '/images/etc.png')
    }

    this.setData({
      filteredDishes: filtered,
      dishes: filtered
    })
    
    // After filtering, regroup the dishes by type
    this.groupDishesByType()
    // Also extract pending dishes
    this.extractPendingDishes()
  },

  async surpriseMe() {
    const dishes = this.data.dishes
    if (dishes.length === 0) return
    
    // Filter out pending dishes first
    const nonPendingDishes = dishes.filter(dish => dish.image !== '/images/etc.png')
    
    // Filter dishes by type
    const mainDishes = nonPendingDishes.filter(dish => 
      dish.type !== 'drink' && dish.type !== 'vegetable'
    )
    const vegDishes = nonPendingDishes.filter(dish => 
      dish.type === 'vegetable'
    )

    // Check if we have enough dishes of each type
    if (mainDishes.length === 0 || vegDishes.length === 0) {
      wx.showToast({
        title: '菜品不足',
        icon: 'error'
      })
      return
    }

    // Select random dishes from each category
    const randomMain = mainDishes[Math.floor(Math.random() * mainDishes.length)]
    const randomVeg = vegDishes[Math.floor(Math.random() * vegDishes.length)]

    // Update the filtered dishes to show only these two selections, with vegetable at the end
    this.setData({
      filteredDishes: [randomMain, randomVeg],
      pendingDishes: [] // Clear pending dishes when in surprise mode
    })
    
    // After filtering, regroup the dishes by type
    this.groupDishesByType()
  },

  resetDishes() {
    this.setData({
      filteredDishes: this.data.dishes,
      pendingDishes: this.data.dishes.filter(dish => dish.image === '/images/etc.png') // Restore pending dishes
    })
    
    // After resetting, regroup the dishes by type
    this.groupDishesByType()
  },

  showAddDishPopup() {
    this.setData({
      showTypeFilterPopup: true,
      isAddingDish: true,
      tempSelectedType: '',
      tempUserFilter: '',
      tempDishName: ''
    });
  },

  onTempDishNameInput(e) {
    this.setData({
      tempDishName: e.detail.value
    });
  },

  addDishFromPopup() {
    if (!this.data.tempDishName || !this.data.tempDishName.trim()) {
      wx.showToast({
        title: '请输入菜品名称',
        icon: 'none'
      });
      return;
    }

    if (!this.data.tempUserFilter) {
      wx.showToast({
        title: '请选择来源',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.tempSelectedType) {
      wx.showToast({
        title: '请选择菜品类别',
        icon: 'none'
      });
      return;
    }

    this.setData({ isLoading: true });

    const newDish = {
      name: this.data.tempDishName.trim(),
      image: this.data.tempUserFilter === 'expert' 
             ? '/images/EXPERT.jpg' 
             : (this.data.tempUserFilter === 'pending' 
                ? '/images/etc.png' 
                : '/images/Ricky.jpg'),
      type: this.data.tempSelectedType || "",
    };

    api.addDish(newDish)
      .then(result => {
        console.log('Added dish:', result);
        this.setData({
          tempDishName: '',
          isLoading: false,
          showTypeFilterPopup: false,
          isAddingDish: false
        });
        this.loadDishes();
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
      })
      .catch(error => {
        console.error('Failed to add dish:', error);
        this.setData({ isLoading: false });
        wx.showToast({
          title: '添加失败',
          icon: 'error'
        });
      });
  },

  // Toggle expansion for a specific dish type
  toggleTypeExpansion(e) {
    const type = e.currentTarget.dataset.type;
    const expandedTypes = { ...this.data.expandedTypes };
    
    // Toggle the expansion state
    expandedTypes[type] = !expandedTypes[type];
    
    this.setData({ expandedTypes });
  },

  // Extract pending dishes (with etc.png image)
  extractPendingDishes() {
    const pendingDishes = this.data.filteredDishes.filter(dish => 
      dish.image === '/images/etc.png'
    )
    this.setData({ pendingDishes })
  },
})
