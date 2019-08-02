import { Content } from 'native-base';
import request from '../../helpers/request';
import { getDomain, getRestDomain, getQueryString } from '../../helpers/utils';

const restPath = getRestDomain();

export function getDMList(params) {
  const { token, user_id } = params;

  const url = `${restPath}/message/lastMessages/dm/${user_id}?page=1&max=50`;

  const page = 1;
  const max = 50;

  return request(url, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    method: 'get',
    page,
    max
  });
}

export function getDMroomMsgContent(params) {
  const url = `${restPath}/message/query/room/${params.asset_id}`;

  const obj = {
    body: {},
    query: {
      roomId: params.room_id
    }
  };

  return request(url, {
    headers: {
      Authorization: `Bearer ${params.token}`
    },
    method: 'post',
    data: {
      ...obj.body
    }
  });
}

export function sendSocketTextMsg(params) {
  const url = `${restPath}/message?roomId=${params.room_id}`;

  const obj = {
    body: {
      client_id: params.client_id,
      asset_id: params.asset_id,
      from_id: params.from_id,
      from_name: params.from_name,
      from_type: params.from_type,
      msg_cat: params.msg_cat,
      msg_type: params.msg_type,
      content: params.content,
      created_at: params.created_at,
      room_id: params.room_id
    },
    query: {
      roomId: params.room_id
    }
  };

  return request(url, {
    headers: {
      Authorization: `Bearer ${params.token}`
    },
    method: 'post',
    data: {
      ...obj.body
    }
  });
}
