import request from "../../helpers/request";
import {getDomain, getRestDomain} from "../../helpers/utils";
import {settings} from "../../helpers/constant";

const path = getDomain();
const restPath = getRestDomain();

const PASSWORD_CHANGE_URL = `${restPath}/users/self/password/change`;

const UPDATE_USER_PROFILE_URL = `${restPath}/users/profile/`;

const UPLOAD_PROFILE_PIX_URL = `${restPath}/file`;

export function login(params) {
  const obj = {username: params.username, password: params.password};
  return request(`${path}/auth/token`, {
    headers: {
      "X-API-KEY": settings.apiKey,
    },
    method: "post",
    data: obj,
  });
}

export function refresh(params) {
  const obj = {refresh_token: params.refresh_token};
  return request(`${path}/auth/refresh`, {
    headers: {
      "X-API-KEY": settings.apiKey,
    },
    method: "post",
    data: obj,
  });
}

// Change user password
export function changePassword(params) {
  const {curPass, newPass, retypePass, token} = params;
  const obj = {
    current: curPass,
    new: newPass,
    confirm: retypePass,
  };

  return request(PASSWORD_CHANGE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "post",
    data: obj,
  });
}

// Update user profile
export function updateProfile(params) {
  const {
    userID,
    newName,
    newAbout,
    newEmail,
    newAddress,
    newPhone,
    avatar,
    token,
  } = params;

  const url = `${UPDATE_USER_PROFILE_URL}${userID}`;

  const obj = {
    about: newAbout,
    name: newName,
    email: newEmail,
    phone: newPhone,
    address: newAddress,
    avatar: avatar,
    token: token,
  };

  return request(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "post",
    data: obj,
  });
}

// Upload profile photo to server
export function uploadProfilePix(params) {
  let token = `Bearer ${params.token}`;

  const data = new FormData();
  data.append("file", {
    uri: params.file,
    type: params.fileType,
    name: params.fileName,
  });

  return request(UPLOAD_PROFILE_PIX_URL, {
    headers: {
      Authorization: token,
    },
    method: "post",
    data: data,
  });
}

// Update profile pic
export function updateProfilePix(params) {
  const {user_id, avatar, token} = params;
  const url = `${UPDATE_USER_PROFILE_URL}${user_id}`;

  const obj = {
    avatar: avatar,
  };

  return request(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "post",
    data: obj,
  });
}
