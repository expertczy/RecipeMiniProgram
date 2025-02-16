const API_ENDPOINT = 'https://7ghbxbrcgf.execute-api.eu-west-2.amazonaws.com'

export const api = {
  getDishes() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_ENDPOINT}/dishes`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('API Success Response:', res)
          if (res.statusCode === 200) {
            const dishes = res.data.dishes || res.data.data || res.data
            if (Array.isArray(dishes)) {
              resolve(dishes)
            } else {
              reject(new Error('Invalid data format'))
            }
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          console.error('API Request Failed:', error)
          reject(error)
        }
      })
    })
  },

  addDish(dish) {
    return new Promise((resolve, reject) => {
      const cleanDish = {
        name: dish.name,
        image: dish.image,
        ingredients: "",
        steps: ""
      }

      console.log('Sending to API:', cleanDish)

      wx.request({
        url: `${API_ENDPOINT}/dishes`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: cleanDish,
        success: (res) => {
          console.log('Add Dish Response:', res)
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(res.data.dish || res.data)
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          console.error('Add Dish Failed:', error)
          reject(error)
        }
      })
    })
  },

  updateDish(id, dish) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_ENDPOINT}/dishes/${id}`,
        method: 'PUT',
        data: dish,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`))
          }
        },
        fail: reject
      })
    })
  },

  deleteDish(id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_ENDPOINT}/dishes/${id}`,
        method: 'DELETE',
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`))
          }
        },
        fail: reject
      })
    })
  }
} 