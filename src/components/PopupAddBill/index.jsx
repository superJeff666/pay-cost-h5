import { forwardRef, useEffect, useRef, useState  } from "react";
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Popup, Icon,Keyboard,Input, Toast } from "zarm";
import cx from 'classnames';
import PopupDate from "../PopupDate";
import CustomIcon from "../CustomIcon";
import {get,post, typeMap} from '@/utils';
import s from './style.module.less'

const PopupAddBill = forwardRef(({detail = {}, onReload},ref) => {
    const [show, setShow] = useState(false);
    const [payType, setPayType] = useState('expense'); // 支出或者收入类型
    const dateRef = useRef();
    const id = detail && detail.id; // 外部传进来的账单详情 id
    const [date, setDate] = useState(new Date()) // 日期
    const [amount, setAmount] = useState(''); // 账单价格

    const [currentType, setCurrentType] = useState({}) // 当前选中账单类型
    const [expense, setExpense] = useState([]) // 支出类型数组
    const [income, setIncome] = useState([]) // 收入类型数组
    const [remark, setRemark] = useState('') // 备注
    const [showRemark, setShowRemark] = useState(false) // 备注输入框展示控制

    useEffect(() => {
       if(detail.id) {
        setPayType(detail.pay_type === 1 ? 'expense': 'income');
        setCurrentType({
          id: detail.type_id,
          name: detail.type_name
        })
        setRemark(detail.remark);
        setAmount(detail.amount);
        setDate(dayjs(Number(detail.date)).$d);
       }
    },[detail])

    useEffect(async() => {
        const {data: {list}} = await get('/api/type/list');
        const _expense = list.filter(i => i.type === 1) // 支出类型
        const _income = list.filter(i => i.type === 2) // 收入类型
        setExpense(_expense)
        setIncome(_income);
        // 没有id的情况下,是新建账单
        if(!id) {
          setCurrentType(_expense[0]); // 新建账单，类型默认是支出类型数组的第一项
        }
    },[])

    // 切换收入支出
    const changeType = (type) => {
        setPayType(type)
        if(type === 'expense') {
            setCurrentType(expense[0])
        } else {
            setCurrentType(income[0])
        }
    }

    // 日期选择回调
    const selectDate = (val) => {
        setDate(val);
    }

    // 日期弹框
    const handleDatePop = () => {
        dateRef.current && dateRef.current.show()
    }

    // 监听输入框改变值
    const handleMoney = (value) => {
      value = String(value);
      // 点击删除按钮
      if(value === 'delete') {
          let _amount = amount.slice(0, amount.length - 1);
          setAmount(_amount)
          return;
      }

      // 点击确认按钮时
      if(value === 'ok') {
          addBill()
          return;
      }
      // 当输入的值为'.' 且 已经存在 '.', 则不让其继续字符串相加
      if(value === '.' && amount.includes('.')) return;
      // 小数点后保留两位，当超过两位时，不让其字符串继续相加
      if(value !== '.' && amount.includes('.') && amount && amount.split('.')[1].length > 2) return;
      setAmount(amount + value);
    }

    // 添加账单
    const addBill = async() => {
        if(!amount) {
            Toast.show('请输入具体金额')
            return;
        }
        const params = {
            amount: Number(amount).toFixed(2), // 账单金额小数点后保留两位
            type_id: currentType.id, // 账单种类id
            type_name: currentType.name, // 账单种类名称
            date: dayjs(date).unix() * 1000,// 日期传时间戳
            pay_type: payType === 'expense' ? 1: 2, //账单类型传1或者2
            remark: remark || '' // 备注
        }
        if(id) {
          params.id = id;
          await post('/api/bill/update',params)
          Toast.show('修改成功')
        } else {
            await post('/api/bill/add',params)
            setAmount('')
            setPayType('expense')
            setCurrentType(expense[0])
            setDate(new Date())
            setRemark('')
            Toast.show('添加成功')
        }
        setShow(false)
        if(onReload) onReload()
    }

    // 选择账单类型
    const chooseType = (item) => {
        setCurrentType(item)
    }

    if(ref) {
        ref.current = {
            show: () => {
                setShow(true)
            },
            close: () => {
                setShow(false)
            }
        }
    }
    return <Popup
        visible={show}
        direction={'bottom'}
        onMaskClick={() => setShow(false)}
        destroy={false}
        mountContainer={() => document.body}
    >
       <div className={s.addWrap}>
           <header className={s.header}>
                <span className={s.close} onClick={() => setShow(false)}>
                    <Icon type="wrong" />
                </span>
           </header>
           <div className={s.filter}>
               <div className={s.type}>
                   <span 
                     onClick={() => changeType('expense')}
                     className={cx({[s.expense]:true, [s.active]:payType === 'expense'})}
                   >
                       支出
                  </span>
                   <span
                     onClick={() => changeType('income')}
                     className={cx({[s.income]:true,[s.active]:payType === 'income'})}
                   >
                       收入
                   </span>
               </div>
               <div className={s.time} onClick={handleDatePop}>
                   {dayjs(date).format('MM-DD')} <Icon className={s.arrow} type="arrow-bottom" />
               </div>
               <PopupDate onSelect={selectDate} ref={dateRef}  />
           </div>
           <div className={s.money}>
               <span className={s.sufix}>¥</span>
               <span className={cx(s.amount,s.animation)}>{amount}</span>
           </div>
           <div className={s.typeWrap}>
               <div className={s.typeBody}>
                   {
                      (payType === 'expense' ? expense: income).map(item => <div
                        onClick={() => chooseType(item)}
                        key={item.id}
                        className={s.typeItem}
                      >
                          <span className={cx({[s.iconfontWrap]:true, [s.expense]:payType === 'expense',[s.income]:payType === 'income', [s.active]:currentType.id === item.id})}>
                              <CustomIcon className={s.iconfont} type={typeMap[item.id].icon} />
                          </span>
                          <span>{item.name}</span>
                      </div>) 
                   }
               </div>
           </div>
           <div className={s.remark}>
               {
                   showRemark? <Input
                      autoHeight
                      showLength
                      maxLength={50}
                      type='text'
                      rows={3}
                      value={remark}
                      placeholder='请输入备注信息'
                      onChange={(val) => setRemark(val)}
                      onBlur={() => setShowRemark(false)}
                   />: <span onClick={() => setShowRemark(true) }>{remark || '添加备注'}</span>
               }
           </div>
           <Keyboard type="price" onKeyClick={(value) => handleMoney(value) } />
       </div>
    </Popup>
})
export default PopupAddBill