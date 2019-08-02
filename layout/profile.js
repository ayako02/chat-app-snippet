import React, {Component} from "react";
import {connect} from "dva";
import {routerRedux} from "dva/router";
import * as Font from "expo-font";
import {
  Thumbnail,
  Icon,
  Container,
  Footer,
  FooterTab,
  ActionSheet,
} from "native-base";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Keyboard,
  BackHandler,
} from "react-native";
import s from "./profile.style";
import NavBar from "../../components/NavBar";
import {settings} from "../../helpers/constant";
import normalEye from "../../assets/eye.png";
import closeEye from "../../assets/eye2.png";
import {getRestDomainXapi} from "../../helpers/utils";

const DESTRUCTIVE_INDEX = 3;
const CANCEL_INDEX = 4;
const BUTTONS = ["相机", "照片", "取消"];
const path = getRestDomainXapi();

class Profile extends Component {
  state = {
    changePasswordModal: false,
    userInfoModal: false,
    passwordVisible: false,
    passwordSecure: true,
    errorMessage: "text",
    errorDisplay: false,
    currentPassword: "",
    newPassword: "",
    retypePassword: "",
    email: this.props.userModel.email,
    phone: this.props.userModel.phone,
    name: this.props.userModel.name,
    about: this.props.userModel.about,
    address: this.props.userModel.address,
  };

  componentWillMount() {
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
  }

  async componentDidMount() {
    // await Font.loadAsync({
    //   Roboto: "native-base/Fonts/Roboto.ttf",
    //   Roboto_medium: "native-base/Fonts/Roboto_medium.ttf",
    // });
  }

  componentDidUpdate(prevProps) {
    if (this.props.userModel.success !== prevProps.userModel.success) {
      this.closeProfileModal();
    }
  }

  setChangePasswordModalStatus(visible) {
    this.setState({changePasswordModal: visible});
  }

  setUserInfoModalStatus(visible) {
    this.setState({userInfoModal: visible});
  }

  capitalizeFirstChar = e => e.charAt(0).toUpperCase() + e.slice(1);

  handleBackPressed = () => {
    this.props.dispatch(routerRedux.goBack());
  };

  handleSignOut = () => {
    this.props.dispatch({
      type: "appModel/logout",
      payload: {
        token: "",
      },
    });

    this.props.dispatch(routerRedux.push("/login"));
  };

  handleEyePressed = () => {
    const {passwordVisible} = this.state;
    const {passwordSecure} = this.state;

    if (passwordVisible && !passwordSecure) {
      this.setState({
        passwordVisible: false,
        passwordSecure: true,
      });
    } else if (!passwordVisible && passwordSecure) {
      this.setState({
        passwordVisible: true,
        passwordSecure: false,
      });
    }
  };

  handleProfilePicPressed = () => {
    ActionSheet.show(
      {
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX,
        destructiveButtonIndex: DESTRUCTIVE_INDEX,
        title: "选项：",
      },
      buttonIndex => {
        this.setState({clicked: BUTTONS[buttonIndex]});
        const op = BUTTONS[buttonIndex];

        if (op === "相机") {
          this.handleCameraPressed();
        } else if (op === "照片") {
          this.handleGalleryPress();
        }
      },
    );
  };

  handleCameraPressed = () => {
    console.log("Camera");

    this.props.dispatch({
      type: "appModel/NavigateToCameraScreen",
      payload: {
        cameraIdentification: "profile",
        dispatch: this.props.dispatch,
      },
    });
  };

  handleGalleryPress = () => {
    console.log("gallery");

    this.props.dispatch({
      type: "mediaModel/RetrieveGalleryPicture",
      payload: "",
    });
  };

  handlePassModalClosePressed = () => {
    this.setChangePasswordModalStatus(!this.state.changePasswordModal);

    this.setState({
      errorDisplay: false,
    });
  };

  handleUserInfoClosePressed = () => {
    this.setUserInfoModalStatus(!this.state.userInfoModal);
  };

  handleSubmit = () => {
    Keyboard.dismiss();

    this.setState({
      errorDisplay: false,
    });

    const {currentPassword} = this.state;
    const {newPassword} = this.state;
    const {retypePassword} = this.state;
    const {token} = this.props.appModel;

    const curPass = currentPassword.trimLeft().trimRight();
    const newPass = newPassword.trimLeft().trimRight();
    const retypePass = retypePassword.trimLeft().trimRight();

    if (curPass === "" || newPass === "" || retypePass === "") {
      this.setState({
        errorDisplay: true,
        errorMessage: "请勿留空",
      });
    } else if (curPass !== "" && newPass !== "" && retypePass !== "") {
      this.setState({
        errorDisplay: false,
      });

      if (
        curPass.length.toString() < 8 ||
        newPass.length.toString() < 8 ||
        retypePass.length.toString() < 8
      ) {
        this.setState({
          errorDisplay: true,
          errorMessage: "密码不得少于8个字符",
        });
      } else {
        this.setState({
          errorDisplay: false,
        });
        if (newPass !== retypePass) {
          this.setState({
            errorDisplay: true,
            errorMessage: "新密码和重复密码不吻合",
          });
        } else {
          this.setState({
            errorDisplay: false,
          });
          this.props.dispatch({
            type: "userModel/ChangePassword",
            payload: {
              curPass,
              newPass,
              retypePass,
              token,
              dispatch: this.props.dispatch,
            },
          });
        }
      }
    }
  };

  updateProfile = () => {
    Keyboard.dismiss();

    const {name} = this.state;
    const {about} = this.state;
    const {phone} = this.state;
    const {email} = this.state;
    const {address} = this.state;
    const userID = this.props.appModel.user_id;
    const {token} = this.props.appModel;
    const {avatar} = this.props.userModel;

    const newName = name.trimLeft().trimRight();
    const newAbout = about.trimLeft().trimRight();
    const newPhone = phone.trimLeft().trimRight();
    const newEmail = email.trimLeft().trimRight();
    const newAddress = address.trimLeft().trimRight();

    this.props.dispatch({
      type: "userModel/UpdateProfile",
      payload: {
        newName,
        newAbout,
        newPhone,
        newEmail,
        newAddress,
        userID,
        avatar,
        token,
      },
    });
  };

  closeProfileModal = () => {
    if (this.props.userModel.success) {
      this.handleUserInfoClosePressed();
      this.props.dispatch({
        type: "userModel/resetSuccess",
        payload: {
          success: false,
        },
      });
    }
  };

  renderMenu = () => (
    <Menu>
      <MenuTrigger style={s.menuTrigger}>
        <Icon type="Ionicons" name="more" style={s.headerMenuIcon} />
      </MenuTrigger>

      <MenuOptions customStyles={optionsStyles}>
        <MenuOption
          onSelect={() => {
            this.setChangePasswordModalStatus(true);
          }}
          style={s.fieldWBorder}>
          <Text style={s.fieldText}>修改密码</Text>
        </MenuOption>
        <MenuOption onSelect={this.handleSignOut} style={s.fieldXBorder}>
          <Text style={s.fieldText}>退出</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );

  renderNotification = () => (
    <TouchableOpacity>
      <Icon type="Ionicons" name="notifications" style={s.headerNotiIcon} />
    </TouchableOpacity>
  );

  renderChangePasswordModal = () => {
    const {passwordVisible} = this.state;
    const {passwordSecure} = this.state;
    const {errorDisplay} = this.state;

    return (
      <Modal
        animationType="fade"
        transparent
        visible={this.state.changePasswordModal}
        onRequestClose={() => {
          console.log("Modal onRequestClose");
        }}>
        <View style={s.modalWrapper}>
          <View style={s.modalContainer}>
            <View>
              <View style={s.modalHeaderWrapper}>
                <TouchableOpacity onPress={this.handlePassModalClosePressed}>
                  <Icon type="Ionicons" name="close" style={s.closeIcon} />
                </TouchableOpacity>
              </View>

              <View style={s.middleContentWrapper}>
                <Text style={s.modalTitle}>修改密码</Text>

                <View style={s.currentPassFieldWrapper}>
                  <TextInput
                    value={this.state.currentPassword}
                    secureTextEntry={passwordSecure}
                    style={s.currentPassField}
                    placeholder="当前密码"
                    onChangeText={currentPassword => {
                      this.setState({currentPassword});
                    }}
                  />

                  <TouchableOpacity
                    onPress={this.handleEyePressed}
                    style={s.eyeButtonWrapper}>
                    <Image
                      source={passwordVisible ? normalEye : closeEye}
                      style={s.eyeIcon}
                    />
                  </TouchableOpacity>
                </View>

                <TextInput
                  value={this.state.newPassword}
                  secureTextEntry={passwordSecure}
                  style={s.modalInputField}
                  placeholder="新密码 (字母数字混合至少8位数)"
                  onChangeText={newPassword => {
                    this.setState({newPassword});
                  }}
                />

                <TextInput
                  value={this.state.retypePassword}
                  secureTextEntry={passwordSecure}
                  style={s.modalInputField}
                  placeholder="重复密码 (重新输入一次新密码)"
                  onChangeText={retypePassword => {
                    this.setState({retypePassword});
                  }}
                />

                {errorDisplay && (
                  <View style={s.errorBoxWrapper}>
                    <Icon
                      type="Ionicons"
                      name="information-circle-outline"
                      style={s.errorIcon}
                    />
                    <Text style={s.errorText}>{this.state.errorMessage}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={s.modalButtonWrapper}>
              <TouchableOpacity
                onPress={this.handlePassModalClosePressed}
                style={s.cancelButton}>
                <Text style={s.buttonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.handleSubmit}
                style={s.saveButton}>
                <Text style={s.buttonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  renderUserInfoModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={this.state.userInfoModal}
      onRequestClose={() => {
        console.log("Modal onRequestClose");
      }}>
      <View style={s.modalWrapper}>
        <View style={s.profileModalContainer}>
          <View>
            <View style={s.modalHeaderWrapper}>
              <TouchableOpacity
                onPress={() => {
                  this.setUserInfoModalStatus(!this.state.userInfoModal);
                }}>
                <Icon type="Ionicons" name="close" style={s.closeIcon} />
              </TouchableOpacity>
            </View>

            <View style={s.middleContentWrapper}>
              <Text style={s.modalTitle}>编辑个人资料</Text>

              <TextInput
                value={this.state.name}
                style={s.modalInputField}
                placeholder="姓名"
                onChangeText={name => {
                  this.setState({name});
                }}
              />

              <TextInput
                value={this.state.about}
                style={s.modalInputField}
                placeholder="个人签名"
                onChangeText={about => {
                  this.setState({about});
                }}
              />

              <TextInput
                value={this.state.email}
                style={s.modalInputField}
                placeholder="邮箱"
                onChangeText={email => {
                  this.setState({email});
                }}
              />

              <TextInput
                value={this.state.phone}
                style={s.modalInputField}
                placeholder="手机号码"
                onChangeText={phone => {
                  this.setState({phone});
                }}
              />

              <TextInput
                value={this.state.address}
                style={s.modalInputField}
                placeholder="地址"
                onChangeText={address => {
                  this.setState({address});
                }}
              />
            </View>
          </View>

          <View style={s.modalButtonWrapper}>
            <TouchableOpacity
              onPress={this.handleUserInfoClosePressed}
              style={s.cancelButton}>
              <Text style={s.buttonText}>取消</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.updateProfile} style={s.saveButton}>
              <Text style={s.buttonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  renderHeaderBar = () => (
    <View style={s.headerContentWrapper}>
      <TouchableOpacity onPress={this.handleBackPressed}>
        <Icon type="AntDesign" name="left" style={s.headerBackIcon} />
      </TouchableOpacity>

      <Text style={s.headerTitle}>个人主页</Text>

      {this.renderMenu()}
    </View>
  );

  renderHeaderUserInfo = () => {
    const {name} = this.props.userModel;
    const avatar = `${path}${this.props.userModel.avatar}`;

    return (
      <View style={s.profileInfoWrapper}>
        <TouchableOpacity
          style={s.avatarWrapper}
          onPress={this.handleProfilePicPressed}>
          <Thumbnail source={{uri: avatar}} style={s.avatarWrapper} />
        </TouchableOpacity>

        <View style={s.profileTextWrapper}>
          <View style={{alignItems: "flex-start"}}>
            <Text style={s.userName}>{this.capitalizeFirstChar(name)}</Text>
            <Text note numberOfLines={1} style={s.userPosition}>
              {this.props.userModel.about}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              this.setUserInfoModalStatus(true);
            }}>
            <Icon type="FontAwesome" name="edit" style={s.editInfoIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderProfileInfoSection = () => (
    <View style={s.listWrapper}>
      <View style={s.listItemWrapper}>
        <Image
          source={require("../../assets/envelope.png")}
          style={s.listIcon}
        />
        <Text style={s.listTitle}>{this.props.userModel.email}</Text>
      </View>

      <View style={[s.listItemWrapper, s.mt]}>
        <Image source={require("../../assets/mobile.png")} style={s.listIcon} />
        <Text style={s.listTitle}>{this.props.userModel.phone}</Text>
      </View>

      <View style={[s.listItemWrapper, s.mt]}>
        <Image
          source={require("../../assets/language.png")}
          style={s.listIcon}
        />
        <Text style={s.listTitle}>中文（简体）</Text>
      </View>

      <View style={[s.listItemWrapper, s.mt]}>
        <Image
          source={require("../../assets/location.png")}
          style={s.listIcon}
        />
        <Text style={s.listTitle}>{this.props.userModel.address}</Text>
      </View>
    </View>
  );

  render() {
    return (
      <Container style={s.container}>
        <View style={s.headerWrapper}>
          {this.renderHeaderBar()}
          {this.renderHeaderUserInfo()}
          {this.renderProfileInfoSection()}
        </View>

        {this.renderChangePasswordModal()}
        {this.renderUserInfoModal()}

        <Footer>
          <FooterTab>
            <NavBar />
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const optionsStyles = {
  optionsContainer: {
    marginTop: 35,
    width: 130,
  },
};

const mapStatesToProps = ({userModel, appModel, mediaModel}) => ({
  userModel,
  appModel,
});
export default connect(mapStatesToProps)(Profile);
