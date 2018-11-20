//app.js
App({

  onLaunch: function () {
    // 展示本地存储能力
    var _this =this
    this.getLoading(false)
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              console.log(res.userInfo)
            }
          })
        }
      }
    })
  },

  globalData: {
    userInfo: null,
    sid:'',
  },

  //创建一个towxml全局对象，其他页面可直接调用
  towxml: new Towxml(),
  //接口地址
  port: port,
  // baseUrl: 'http://192.168.2.115:81/',
  // baseImgUrl: 'http://192.168.2.115:81/',

  baseUrl: 'https://xiaochengxu.angkebrand.com/',
  baseImgUrl: 'https://xiaochengxu.angkebrand.com/',

  shareTitle: '五象科技', // 默认的分享出去的title
  //定义全局发送数据的公共方法
  commonAjax: function (url, data, methods, headers, callback, loadType, zeroFun) {
    var _this = this;
    var hearder;
    if (methods == 'post') {
      hearder = {
        'content-type': 'application/x-www-form-urlencoded',
      }
    } else {
      hearder = {
        'content-type': 'application/json',
      }
    }
    data.sid = wx.getStorageSync('sid');
    //检测是否有网络
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType
        if (networkType === 'none') {
          _this.commonMsg('error', '手机断网了!')
        } else {
          _this.commonLoading(loadType);
          wx.request({
            url: _this.baseUrl + url,
            data: data,
            method: methods,
            header: hearder,
            success: function (res) {
              wx.hideLoading();
              wx.hideNavigationBarLoading()
              if (res.data.code == 1) {
                callback(res.data);

              } else if (res.data.code == 0) {
                _this.commonMsg('error', res.data.message)
                zeroFun(res);
              }
              if (res.data.code == -40000){
                _this.getLoading(true, url, data, methods, headers, callback, loadType, zeroFun)
              }
              wx.stopPullDownRefresh()
            },
            fail: function (err) {
              wx.hideLoading();
              wx.hideNavigationBarLoading()
              _this.commonMsg('error', '数据获取失败!')
            }
          })
        }
      }
    })

  },
  /*
  *公共消息提示框
  *@function commonMsg
  @params {type,msgText}    type=>提示类型{success,error} ，msgText=>提示文字
  */
  commonMsg: function (type, msgText) {
    if (type === 'success') {
      wx.showToast({
        title: msgText,
        icon: 'success',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: msgText,
        image: '/img/error.png',
        mask: true,
        duration: 2000
      })
    }
  },
  /*
*公共Loading加载框
*@function commonLoading
*@params {loadType} 默认值 'mask' ; 可选值： 'mask', 'top', 'noMask'
*/
  commonLoading: (loadType = 'mask') => {
    if (loadType == 'mask') {
      wx.showLoading({
        title: '拼命加载中',
        mask: true,
      })
    } else if (loadType == 'top') {
      wx.showNavigationBarLoading()
    } else if (loadType == 'noMask') {
      wx.showLoading({
        title: '拼命加载中',
      })
    }
  },
/*
* 登录
* @function getLoading
* @params {}
* @barth {Constantine, 2017-10-27 10:18:33}
*/
  getLoading: function (requestAgain, url, data, methods, headers, callback, loadType, zeroFun) {
    let _this = this
    wx.login({
      success: function (res1) {
        console.log(res1)
        wx.getUserInfo({
          success: function (res) {
            // console.log('请求登录  登录成功')
            console.log(res)
            // console.log('temp 登录成功')
            var userInfo = res.userInfo;
            wx.request({
              url: _this.baseUrl + 'mini_shop/index.php?m=user&c=login&a=wx_login',
              method: 'post',
              data: {
                'jsCode': res1.code,
                'nickName': userInfo.nickName,
                'gender': userInfo.gender,
                'pic': userInfo.avatarUrl,
                'city': userInfo.city,
                'province': userInfo.province,
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              success: function (res) {
                wx.setStorageSync('sid', res.data.sid);
                if(requestAgain){
                  console.log('将在这里从新请求 ')
                  // _this.commonAjax(url, data, methods, headers, callback, loadType, zeroFun)
                }
              }
            })
          }
        })
      }, fail: function (err) {
        console.error(err)
      }
    })
  },

})
