import { config } from '../config/config.js'

export const api = {
  getDishes() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.API_ENDPOINT}/dishes`,
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
        steps: "",
        type: dish.type,
      }

      console.log('Sending to API:', cleanDish)

      wx.request({
        url: `${config.API_ENDPOINT}/dishes`,
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
      console.log('API updateDish received dish:', dish);
      console.log('API updateDish image value:', dish.image);
      
      const cleanDish = {
        name: dish.name,
        image: dish.image,
        ingredients: dish.ingredients || "",
        steps: dish.steps || "",
        type: dish.type
      }

      console.log('API sending cleanDish:', cleanDish);
      console.log('API sending image value:', cleanDish.image);

      wx.request({
        url: `${config.API_ENDPOINT}/dishes/${id}`,
        method: 'PUT',
        header: {
          'Content-Type': 'application/json'
        },
        data: cleanDish,
        success: (res) => {
          console.log('Update Dish Response:', res);
          console.log('Response status:', res.statusCode);
          console.log('Response data:', res.data);
          
          if (res.statusCode === 200) {
            // The server might not update the image correctly
            // Return our local data instead of the server response
            const responseData = res.data;
            
            // Override the image with our local value
            if (responseData) {
              responseData.image = cleanDish.image;
            }
            
            resolve(responseData);
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          console.error('Update Dish Failed:', error)
          reject(error)
        }
      })
    })
  },

  deleteDish(id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.API_ENDPOINT}/dishes/${id}`,
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