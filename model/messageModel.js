/* eslint-disable no-new-object */
import commonReducers from "../helpers/commonReducers";
import {messageService} from "../services/api";

const INITIAL_STATE = {
  messages: [],
  filecontent: null,
  number: 0,
  isScrollDown: false,
};

handleFileExtension = event => {
  if (event === "jpg") {
    return "image/jpeg";
  }
};

dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  // bstr = Base64.atob(arr[1]),
  const bstr = base64.decode(arr[1]);
  (n = bstr.length), (u8arr = new Uint8Array(n));
  // eslint-disable-next-line no-plusplus
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type: mime});
};

export default {
  namespace: "messageModel",

  state: INITIAL_STATE,

  reducers: {
    ...commonReducers(INITIAL_STATE),
  },

  effects: {
    // For File Upload
    *SendSocketMessage({payload}, {select}) {
      const {msg_type, msg_cat, content, room_id, asset_id} = payload;

      const {userModel, socketModel} = yield select(state => state);
      const {socket} = socketModel;
      const {user_id, name} = userModel;

      const sendObj = {
        asset_id,
        from_id: user_id,
        room_id,
        msg_type,
        msg_cat,
        content,
        from_type: "agent",
        from_name: name,
        created_at: new Date(),
      };
      console.log({SendSocketMessage: sendObj});

      socket.send(JSON.stringify(sendObj));
    },

    *SendSocketTextMsg({payload}, {call, select}) {
      const {userModel, appModel} = yield select(state => state);
      const {user_id, name, client_id} = userModel;
      const {token} = appModel;

      const sendObj = {
        client_id,
        asset_id: payload.asset_id,
        from_id: user_id,
        from_name: name,
        from_type: "agent",
        msg_type: "TEXT",
        msg_cat: payload.kind,
        content: payload.message,
        created_at: new Date(),
        room_id: payload.asset_id,
        token,
      };

      const response = yield call(messageService.sendSocketTextMsg, sendObj);
      console.log({SendSocketTextMsg_res: response});
    },

    *GetMessageList({payload}, {select, call, put}) {
      const {appModel} = yield select(state => state);
      const {token} = appModel;

      const obj = {
        token,
        ...payload,
      };
      const response = yield call(messageService.getMessageList, obj);

      const res = response.data.messages;
      const newRes = res.reverse();

      if (response.status === 200) {
        yield put({
          type: "updateState",
          payload: {
            messages: newRes,
          },
        });
      }
    },

    *GetDMmsgList({payload}, {call, put}) {
      const response = yield call(
        messageService.getDMroomMsgContent,
        payload.data,
      );
      const res = response.data.messages;
      const newRes = res.reverse();

      if (response.status === 200) {
        yield put({
          type: "updateState",
          payload: {
            messages: newRes,
          },
        });
      }
    },
  },
};
