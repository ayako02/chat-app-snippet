/* eslint-disable no-new-object */
import commonReducers from "../helpers/commonReducers";
import {base64ToArrayBuffer} from "../helpers/utils";
import {fileService} from "../services/api";
import {uploadFile} from "../services/FileUpload";
import {msgTypes, msgCat, attachmentType} from "../helpers/constant";
import {getMediaType} from "../helpers/utils";
import {authService} from "../services/api";
import {ToastAndroid} from "react-native";

const INITIAL_STATE = {
  assets: [],
};

export default {
  namespace: "fileModel",

  state: INITIAL_STATE,

  reducers: {
    ...commonReducers(INITIAL_STATE),
  },

  effects: {
    *UploadFile({payload}, {select, call, put}) {
      const {userModel, appModel, roomModel} = yield select(state => state);
      const {user_id, name, client_id, asset_id} = userModel;
      const {currentRoom} = roomModel;
      const {token} = appModel;

      const {fileURI, base64} = payload;
      const fileExtension = fileURI.substr(fileURI.lastIndexOf(".") + 1);
      const fileName = fileURI.substring(fileURI.lastIndexOf("/") + 1);

      const param = {
        query: {
          fileName,
          roomId: asset_id,
          client_id,
        },
        authorization: `Bearer ${token}`,
      };

      const response = yield call(fileService.getUploadUrl, param);

      if (response) {
        if (response.status === 200) {
          const {file} = response.data;

          if (file) {
            const {fileId, url, thumbnail_url} = file;

            const dataBase64 = base64ToArrayBuffer(base64);

            const uploadFileResponse = yield call(uploadFile, {
              url: url,
              file: dataBase64,
            });
            if (uploadFileResponse.status === 200) {
              const sendObj = {
                content: {
                  fileName,
                  fileType: attachmentType[fileExtension],
                  file_id: fileId,
                  thumbnail_id: thumbnail_url ? thumbnail_url.fileId : "",
                  media: getMediaType(attachmentType[fileExtension]),
                },
                msg_type: msgTypes.file,
                msg_cat: msgCat.domain,
                room_id: currentRoom.asset_id,
                asset_id: currentRoom.asset_id,
              };

              console.log({UploadFilesendObj: sendObj});

              yield put({
                type: "messageModel/SendSocketMessage",
                payload: sendObj,
              });

              yield put({
                type: "appModel/NavigateBackToPreviousScreen",
                payload: {
                  dispatch: payload.dispatch,
                  cameraIdentification: payload.cameraIdentification,
                },
              });
            }
          }
        }
      }
    },

    *UploadProfilePix({payload}, {select, call, put}) {
      console.log({UploadProfilePix: payload});
      const {appModel, userModel} = yield select(state => state);
      const {token} = appModel;
      const {user_id} = userModel;

      const obj = {
        token: token,
        file: payload.uri,
        fileName: payload.fileName,
        fileType: payload.fileType,
      };

      const response = yield call(authService.uploadProfilePix, obj);

      const newAvatarUrl = response.data.url;

      const obj2 = {
        token: token,
        user_id: user_id,
        avatar: newAvatarUrl,
      };

      const newResponse = yield call(authService.updateProfilePix, obj2);

      if (newResponse.status === 200) {
        yield put({
          type: "userModel/updateState",
          payload: {...newResponse.data},
        });

        if (payload.cameraIdentification) {
          yield put({
            type: "appModel/NavigateBackToPreviousScreen",
            payload: {
              dispatch: payload.dispatch,
              cameraIdentification: payload.cameraIdentification,
            },
          });
        }

        ToastAndroid.show("照片更新成功！", ToastAndroid.SHORT);
      }
    },
  },
};
