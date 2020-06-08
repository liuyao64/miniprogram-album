// miniprogram/pages/upload/upload.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    promiseImgArr: [], // 图片列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  // 上传图片
  upImg: function() {
    let that = this
    // 选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        wx.showLoading({
          title: '上传中',
        })
        const promiseImgArr = []
        //只能一张张上传 遍历临时的图片数组
        let tempArr = res.tempFilePaths
        tempArr.forEach(filePath => {
          console.log('temp filePath', filePath)
          let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
          //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
          promiseImgArr.push(new Promise((reslove, reject) => {
            let nowTime = new Date().getTime()
            wx.cloud.uploadFile({
              cloudPath: nowTime + suffix,
              filePath: filePath, // 文件路径
            }).then(res => {
              console.log('upload res:', res)
              reslove(res.fileID)
            })
          }))
        })
        Promise.all(promiseImgArr).then(res => {
          console.log('Promise res', res)
          let arr = that.data.promiseImgArr
          wx.hideLoading()
          that.setData({
            promiseImgArr: arr.concat(res)
          })
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  onSubmit(e) {
    let that = this
    let text = e.detail.value.text
    if (this.data.promiseImgArr.length == 0) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
    } else if (text == '') {
      wx.showToast({
        title: '请输入图片描述',
        icon: 'none'
      })
    } else {
      let nowDate = that.getDate(new Date().getTime()).date
      let imgs = that.data.promiseImgArr
      let newImagesObj = {
        uploadTime: that.getDate(new Date().getTime()).wholeTime,
        imgs,
        text
      }
      // images.forEach(item => {
      //   item.text = text
      // })

      db.collection('userAlbum').where({
        date: nowDate,
        _openid: app.globalData.openId
      }).get().then(res => {
        if (res.data.length == 0) {
          db.collection('userAlbum').add({
            data: {
              date: nowDate,
              images: [newImagesObj],
            }
          }).then(resA => {
            console.log('add:', resA)
            if (resA.errMsg == 'collection.add:ok') {
              wx.showToast({
                title: '提交成功',
                icon: 'none',
                duration: 1500
              })
              setTimeout(function() {
                wx.navigateBack({})
              }, 1500)
            }
          })
        } else {
          let id = res.data[0]._id
          let newImgArr = res.data[0].images
          newImgArr.push(newImagesObj)
          console.log('newImgArr:', newImgArr, 'newImagesObj:', newImagesObj)
          db.collection('userAlbum').doc(id).update({
            data: {
              images: _.set(newImgArr)
            },
            success: function(resU) {
              console.log('resU', resU)
              if (resU.errMsg == 'document.update:ok') {
                wx.showToast({
                  title: '提交成功',
                  icon: 'none',
                  duration: 1500
                })
                setTimeout(function() {
                  wx.navigateBack({})
                }, 1500)
              }
            }
          })
        }
      })
    }
  },
  getDate(timestamp) {
    let date = new Date(timestamp)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let week = '周' + '日一二三四五六'.charAt(date.getDay())
    let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    if (month < 10) {
      month = '0' + month
    }
    if (day < 10) {
      day = '0' + day
    }
    return {
      date: month + '月' + day + '日',
      wholeTime: year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})