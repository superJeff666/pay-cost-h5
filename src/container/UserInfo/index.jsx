import { useState,useEffect } from 'react';
import { FilePicker, Button, Input, Toast } from 'zarm';
import { useHistory } from 'react-router-dom';
import Header from '@/components/Header';
import axios from 'axios';
import {get, post} from '@/utils';
import { baseUrl } from '@/config';
import s from './style.module.less'

const UserInfo = () => {
   const history = useHistory();
   const [user, setUser] = useState({}) // 用户
   const [avatar, setAvatar] = useState('') // 头像
   const [signature, setSignature] = useState('') // 个性签名
   const token = localStorage.getItem('token'); // 登录令牌

   useEffect(() => {
     getUserInfo(); 
   },[])

   // 获取用户信息
   const getUserInfo = async() => {
      const { data } = await get('/api/user/get_userinfo');
      setUser(data);
      setAvatar(data.avatar);
      setSignature(data.signature);
   }

  // 获取图片回调
  const handleSelect = (file) => {
      console.log('file', file)
      if(file && file.file.size > 200 * 1024) {
          Toast.show('上传头像不得超过 200 KB！！')
          return;
      }
      let formData = new FormData();
      formData.append('file', file.file)
      axios({
        method: 'post',
        url: `${baseUrl}/upload`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token
        }
      }).then(res => {
          setAvatar(res.data)
      })
  }

  // 保存用户信息
  const save = async() => {
      const { data } = await post('/api/user/edit_userinfo', {
          signature,
          avatar
      });
      Toast.show('修改成功')
      history.goBack()
  }

  return<>
    <Header title='用户信息' />
    <div className={s.userinfo}>
      <h1>个人资料</h1>
      <div className={s.item}>
          <div className={s.title}>头像</div>
          <div className={s.avatar}>
              <img className={s.avatarUrl} src={avatar} alt="" />
              <div className={s.desc}>
                  <span>支持 jpg、png、jpeg 格式大小 200KB 以内的图片</span>
                  <FilePicker className={s.filePicker} onChange={handleSelect} accept='image/*'>
                    <Button className={s.upload} theme='primary' size='xs'>点击上传</Button>
                  </FilePicker>
              </div>
          </div>
      </div>
      <div className={s.item}>
          <div className={s.title}>个性签名</div>
          <div className={s.signature}>
              <Input
                clearable
                value={signature}
                placeholder='请输入个性签名'
                onChange={(value) => setSignature(value)}
              />
          </div>
      </div>
      <Button onClick={save} style={{marginTop: 50}} block theme='primary'>保存</Button>
    </div>
  </>
}
export default UserInfo;