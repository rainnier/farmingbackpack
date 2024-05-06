'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const backpack_client_1 = require('./backpack_client')

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

//当前年份日期时分秒
// The current year, date, hour, minute, and second

function getNowFormatDate() {
  var date = new Date()
  var seperator1 = '-'
  var seperator2 = ':'
  var month = date.getMonth() + 1
  var strDate = date.getDate()
  var strHour = date.getHours()
  var strMinute = date.getMinutes()
  var strSecond = date.getSeconds()
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate
  }
  if (strHour >= 0 && strHour <= 9) {
    strHour = '0' + strHour
  }
  if (strMinute >= 0 && strMinute <= 9) {
    strMinute = '0' + strMinute
  }
  if (strSecond >= 0 && strSecond <= 9) {
    strSecond = '0' + strSecond
  }
  var currentdate =
    date.getFullYear() +
    seperator1 +
    month +
    seperator1 +
    strDate +
    ' ' +
    strHour +
    seperator2 +
    strMinute +
    seperator2 +
    strSecond
  return currentdate
}

let successbuy = 0
let sellbuy = 0

// Cứ mỗi 6 giây đặt lệnh mua/bán 1 lần, ae có thể tăng giảm tùy theo ý thích tối hiểu 3 giây trở lên.
// Place a buy/sell order every 6 seconds. You can adjust the frequency according to your preference, with a minimum interval of 3 seconds
const delayTime = 6
// Điền 0 để tắt tính volumme và fee
// Enter 0 to disable volume and fee calculation
const showVolumeAndFee = 1
let totalVolume = 0
let totalFee = 0
const init = async (client) => {
  try {
    if (showVolumeAndFee) {
      // Tính volume và phí 1000 giao dịch gần nhất
      // Calculate the volume and fees of the 1000 most recent transactions
      let histories = await client.FillHistory({
        symbol: 'JUP_USDC',
        limit: '1000',
      })
      if (histories.length) {
        totalVolume = histories.reduce((pre, next) => {
          return pre + next.quantity * next.price
        }, 0)
        let totalFeeSol =
          histories
            .filter((his) => his.feeSymbol === 'JUP')
            .reduce((pre, next) => {
              return pre + next.fee
            }, 0) * histories[0].price
        let totalFeeUSDC = histories
          .filter((his) => his.feeSymbol === 'USDC')
          .reduce((pre, next) => {
            return pre + next.fee
          }, 0)
        totalFee = totalFeeSol + totalFeeUSDC
      }
    }

    console.log('-----------------------------------------------------')
    console.log('|                                                    |')
    // console.log(
    //   `| Số lần mua thành công: ${successbuy}, Số lần bán thành công:${sellbuy} |`
    // )
    console.log(
      `| Number of successful purchases: ${successbuy}, Number of successful sales:${sellbuy} |`
    )
    // console.log(
    //   `| Volume 1000 giao dịch gần nhất: ${totalVolume.toFixed(2)}           |`
    // )
    console.log(
      `| Volume of the 1000 most recent transactions: ${totalVolume.toFixed(
        2
      )}           |`
    )
    // console.log(
    //   `| Phí 1000 giao dịch gần nhất: ${totalFee.toFixed(2)}                 |`
    // )
    console.log(
      `| Fees of the 1000 most recent transactions: ${totalFee.toFixed(
        2
      )}                 |`
    )
    console.log('|                                                    |')
    console.log('-----------------------------------------------------')

    console.log(
      '\n\n<--------------- x.com/trangchongcheng ---------------> \n\n'
    )

    // console.log(getNowFormatDate(), `Đang chờ ${delayTime} giây...`)
    console.log(getNowFormatDate(), `Waiting for ${delayTime} seconds...`)
    await delay(delayTime * 1000)
    // console.log(getNowFormatDate(), 'Đang lấy thông tin tài khoản...')
    console.log(getNowFormatDate(), 'Fetching account information...')
    let userbalance = await client.Balance()
    // Kiểm tra số dư USDC trong tài khoản có lớn hơn 5 không
    // Check if the balance of USDC in the account is greater than 5
    if (userbalance.USDC.available > 5) {
      await buyfun(client)
    } else {
      await sellfun(client)
      return
    }
  } catch (e) {
    init(client)
    console.log(getNowFormatDate(), 'Order placement failed, retrying... \n \n')
    await delay(1000)
  }
}

const sellfun = async (client) => {
  // Hủy tất cả các đơn đặt hàng chưa hoàn thành
  // Cancel all outstanding orders
  let GetOpenOrders = await client.GetOpenOrders({ symbol: 'JUP_USDC' })
  if (GetOpenOrders.length > 0) {
    let CancelOpenOrders = await client.CancelOpenOrders({ symbol: 'JUP_USDC' })
    // console.log(getNowFormatDate(), 'Hủy tất cả các đơn đặt hàng')
    console.log(getNowFormatDate(), 'Cancel all orders')
  } else {
    console.log(
      getNowFormatDate(),
      //   'Đơn đặt hàng tài khoản bình thường, không cần hủy đơn đặt hàng'
      'The order is normal, no need to cancel'
    )
  }
  //   console.log(getNowFormatDate(), '\n\n Đang lấy thông tin tài khoản...')
  console.log(getNowFormatDate(), '\n\n Fetching account information...')
  // Lấy thông tin tài khoản
  // Fetching account information
  let userbalance2 = await client.Balance()
  //   console.log(getNowFormatDate(), 'Thông tin tài khoản:', userbalance2)
  console.log(getNowFormatDate(), 'Account information:', userbalance2)
  console.log(
    getNowFormatDate(),
    // 'Đang lấy giá thị trường hiện tại của JUP_USDC...'
    'Fetching the current market price of JUP_USDC...'
  )
  // Lấy giá hiện tại
  let { lastPrice: lastPriceask } = await client.Ticker({ symbol: 'JUP_USDC' })
  console.log(
    getNowFormatDate(),
    // 'Giá thị trường hiện tại của JUP_USDC:',
    'The current market price of JUP_USDC:',
    lastPriceask
  )
  //   let quantitys = (userbalance2.JUP.available - 0.02).toFixed(2).toString()
  let quantitys = (userbalance2.JUP.available - 2).toFixed(2).toString()
  //   console.log(getNowFormatDate(), `Đang bán... Bán ${quantitys} SOL`)
  console.log(getNowFormatDate(), `Selling... Selling ${quantitys} JUP`)
  let orderResultAsk = await client.ExecuteOrder({
    orderType: 'Limit',
    price: lastPriceask.toString(),
    quantity: quantitys,
    side: 'Ask', // Bán
    symbol: 'JUP_USDC',
    timeInForce: 'IOC',
  })

  if (orderResultAsk?.status == 'Filled' && orderResultAsk?.side == 'Ask') {
    // console.log(getNowFormatDate(), 'Bán thành công')
    console.log(getNowFormatDate(), 'Sale successful')
    sellbuy += 1
    console.log(
      getNowFormatDate(),
      //   'Chi tiết đơn hàng:',
      'Order details:',
      `Giá bán:${orderResultAsk.price}, Số lượng bán:${orderResultAsk.quantity}, Mã đơn hàng:${orderResultAsk.id}\n\n``Selling price:${orderResultAsk.price}, Quantity for sale:${orderResultAsk.quantity}, Order code:${orderResultAsk.id}\n\n`
    )
    init(client)
  } else {
    // console.log(getNowFormatDate(), 'Bán thất bại ')
    console.log(getNowFormatDate(), 'Sale failed ')
    // throw new Error('Bán thất bại')
    throw new Error('Sale unsuccessful')
  }
}
const buyfun = async (client) => {
  // Hủy tất cả các đơn đặt hàng chưa hoàn thành
  // Cancel all outstanding orders
  let GetOpenOrders = await client.GetOpenOrders({ symbol: 'JUP_USDC' })
  if (GetOpenOrders.length > 0) {
    let CancelOpenOrders = await client.CancelOpenOrders({ symbol: 'JUP_USDC' })
    // console.log(getNowFormatDate(), 'Hủy tất cả các đơn đặt hàng')
    console.log(getNowFormatDate(), 'Cancel all orders')
  } else {
    console.log(
      getNowFormatDate(),
      //   'Tài khoản đặt hàng bình thường, không cần hủy đơn đặt hàng'
      'The account is placing orders normally, no need to cancel any orders'
    )
  }
  //   console.log(getNowFormatDate(), 'Đang lấy thông tin tài khoản...')
  console.log(getNowFormatDate(), 'Fetching account information...')
  // Lấy thông tin tài khoản
  let userbalance = await client.Balance()
  //   console.log(getNowFormatDate(), 'Thông tin tài khoản:', userbalance)
  console.log(getNowFormatDate(), 'Account information:', userbalance)
  console.log(
    getNowFormatDate(),
    // 'Đang lấy giá thị trường hiện tại của JUP_USDC...'
    'Fetching the current market price of JUP_USDC...'
  )
  // Lấy giá hiện tại
  let { lastPrice } = await client.Ticker({ symbol: 'JUP_USDC' })
  console.log(
    getNowFormatDate(),
    // 'Giá thị trường hiện tại của JUP_USDC:',
    'The current market price of JUP_USDC:',
    lastPrice
  )
  console.log(
    getNowFormatDate(),
    // `Đang mua... Sử dụng ${(userbalance.USDC.available - 2)
    //   .toFixed(2)
    //   .toString()} USDC để mua SOL`
    `Buying... Using ${(userbalance.USDC.available - 2)
      .toFixed(2)
      .toString()} USDC to buy JUP`
  )
  let quantitys = ((userbalance.USDC.available - 2) / lastPrice)
    .toFixed(2)
    .toString()
  let orderResultBid = await client.ExecuteOrder({
    orderType: 'Limit',
    price: lastPrice.toString(),
    quantity: quantitys,
    side: 'Bid', // Mua
    symbol: 'JUP_USDC',
    timeInForce: 'IOC',
  })
  if (orderResultBid?.status == 'Filled' && orderResultBid?.side == 'Bid') {
    // console.log(getNowFormatDate(), 'Đặt hàng thành công')
    console.log(getNowFormatDate(), 'Order placed successfully')
    successbuy += 1
    console.log(
      getNowFormatDate(),
      //   'Chi tiết đơn hàng:',
      //   `Giá mua:${orderResultBid.price}, Số lượng mua:${orderResultBid.quantity}, Mã đơn hàng:${orderResultBid.id} \n\n`
      'The order details are as follows:',
      `Purchase price: ${orderResultBid.price},
      Quantity purchased: ${orderResultBid.quantity},
      Order ID: ${orderResultBid.id} \n\n`
    )
    console.log('<--------------- x.com/trangchongcheng ---------------> \n\n')

    init(client)
  } else {
    // console.log(getNowFormatDate(), 'Đặt hàng thất bại')
    console.log(getNowFormatDate(), 'Order placement failed')
    // throw new Error('Mua thất bại')
    throw new Error('Purchase failed')
  }
}

;(async () => {
  // Thay bằng apisecret và apikey của anh em
  const apisecret = '2hynBojQTUe5ZxQAwkm9RgVNRAJDAPQyfnjzLVqGx0U='
  const apikey = 'e4UP0+C9KHxSq4bcRLCUZy8//Sacv3tOpdqnv2N2hsE='
  const client = new backpack_client_1.BackpackClient(apisecret, apikey)
  init(client)
})()
