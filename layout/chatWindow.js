import React, {Component} from "react";
import {connect} from "dva";
import * as ImagePicker from "expo-image-picker";
import * as Font from "expo-font";
import {routerRedux} from "dva/router";
import {
  Icon,
  Content,
  Footer,
  Button,
  ActionSheet,
  FooterTab,
} from "native-base";
import {
  View,
  Text,
  Animated,
  Dimensions,
  Keyboard,
  UIManager,
  TextInput,
  BackHandler,
  TouchableOpacity,
} from "react-native";
import MainLO from "../../layout/mainLO";
import styles from "./chatWindows.style";
import NavBar from "../../components/NavBar";
import ChatDisplaySection from "./chatDisplaySection";
import Roboto from "../../Fonts/Roboto.ttf";
import RobotoMedium from "../../Fonts/Roboto_medium.ttf";

const DESTRUCTIVE_INDEX = 3;
const CANCEL_INDEX = 4;
const BUTTONS = ["相机", "照片", "取消"];

const {State: TextInputState} = TextInput;
class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      init: true,
      message: "",
      newMessage: "",
      messages: [],
      token: "",
      shift: new Animated.Value(0),
      behavior: "position",
    };

    this.myRef = React.createRef();
  }

  componentWillMount() {
    this.keyboardDidShowSub = Keyboard.addListener(
      "keyboardDidShow",
      this.handleKeyboardDidShow,
    );

    this.kayboardDidHideSub = Keyboard.addListener(
      "keyboardDidHide",
      this.handleKeyboardDidHide,
    );

    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.props.dispatch(routerRedux.goBack());
    });
  }

  componentDidMount() {
    // Font.loadAsync({
    //   Roboto,
    //   RobotoMedium,
    // });

    this.getUserList();
  }

  componentDidUpdate(prevProps) {
    const {isScrollDown} = this.props.messageModel;
    console.log({message: this.props.messageModel.isScrollDown});
    console.log({msg2: prevProps.messageModel.isScrollDown});
    if (prevProps.messageModel.isScrollDown !== isScrollDown) {
      this.scroll();
      this.props.dispatch({
        type: "messageModel/updateState",
        payload: {isScrollDown: false},
      });
    }
  }

  getUserList = () => {
    this.props.dispatch({
      type: "userModel/GetUserList",
      payload: {
        token: this.props.appModel.token,
        assetID: this.props.roomModel.currentRoom.asset_id,
      },
    });
  };

  scroll = () => {
    console.log({scroll: this.componentList});
    if (this.componentList) {
      this.componentList._root.scrollToEnd();
    }
  };

  handleChatWindowName = name => {
    if (name) {
      return name;
    }
    return "Random Room";
  };

  handleButtonPress = () => {
    const {message} = this.state;

    return message.length <= 0;
  };

  handleBackPress = () => {
    this.props.dispatch({
      type: "messageModel/updateState",
      payload: {
        messages: [],
      },
    });
    this.props.dispatch(routerRedux.goBack());
  };

  handleSendMessage = () => {
    const {message} = this.state;
    const {roomModel} = this.props;
    const {currentRoom} = roomModel;
    const {asset_id, kind} = currentRoom;

    this.props.dispatch({
      type: "messageModel/SendSocketTextMsg",
      payload: {
        message,
        asset_id,
        kind,
      },
    });

    this.setState({
      message: "",
    });

    Keyboard.dismiss();
  };

  handleKeyboardDidShow = event => {
    const {height: windowHeight} = Dimensions.get("window");
    const keyboardHeight = event.endCoordinates.height;
    const currentlyFocusedField = TextInputState.currentlyFocusedField();
    UIManager.measure(
      currentlyFocusedField,
      (originX, originY, width, height, pageX, pageY) => {
        const fieldHeight = height;
        const fieldTop = pageY;
        const gap = windowHeight - keyboardHeight - (fieldTop + fieldHeight);
        if (gap >= 0) {
          return;
        }
        Animated.timing(this.state.shift, {
          toValue: gap,
          duration: 0,
          useNativeDriver: true,
        }).start();
      },
    );
  };

  handleKeyboardDidHide = () => {
    Animated.timing(this.state.shift, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  handleInfoPress = () => {
    this.props.dispatch(routerRedux.push("/chatInfoPage"));
  };

  handleActionSheet = () => {
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
          this._handleGalleryPress();
        }
      },
    );
  };

  handleCameraPressed = () => {
    console.log("Camera");

    this.props.dispatch({
      type: "appModel/NavigateToCameraScreen",
      payload: {
        cameraIdentification: "chatWindow",
        dispatch: this.props.dispatch,
      },
    });
  };

  _handleGalleryPress = async () => {
    console.log("gallery");
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      base64: true,
      exif: true,
    });

    // Get photo uri & file name
    const fileURI = result.uri;
    const fileName = fileURI.split("/").pop();

    // Get File Type
    const match = /\.(\w+)$/.exec(fileName);
    const fileType = match ? `image/${match[1]}` : `image`;
    const {base64} = result;

    this.props.dispatch({
      type: "fileModel/UploadFile",
      payload: {
        fileURI,
        base64,
      },
    });
  };

  renderTextInputField = () => {
    const isMessageEmpty = this.handleButtonPress();
    return (
      <View style={styles.textAreaWrapper}>
        <TouchableOpacity
          onPress={this.handleActionSheet}
          style={styles.sendButtonWrapper}>
          <Icon type="Ionicons" name="add-circle" style={styles.addIcon} />
        </TouchableOpacity>

        <TextInput
          multiline
          numberOfLines={1}
          autoGrow={false}
          contextMenuHidden={false}
          style={styles.inputText}
          value={this.state.message}
          placeholder="输入消息……"
          onChangeText={message => {
            this.setState({
              message,
            });
          }}
        />

        <TouchableOpacity
          style={styles.sendButtonWrapper}
          disabled={isMessageEmpty}
          onPress={this.handleSendMessage}>
          <Icon type="FontAwesome" name="telegram" style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  renderTopBar = () => {
    const {roomModel} = this.props;
    const {currentRoom} = roomModel;
    const {name} = currentRoom;

    return (
      <View style={styles.headerWrapper}>
        <Button vertical transparent style={{alignSelf: "center"}}>
          <TouchableOpacity onPress={this.handleBackPress}>
            <Icon type="AntDesign" name="left" style={styles.headerIconArrow} />
          </TouchableOpacity>
        </Button>

        <View style={styles.headerTextWrapper}>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {this.handleChatWindowName(name)}
          </Text>
          <Text style={styles.headerSubtitle}>在线</Text>
        </View>

        <Button vertical transparent>
          <TouchableOpacity onPress={this.handleInfoPress}>
            <Icon
              type="Ionicons"
              name="information-circle-outline"
              style={styles.headerIconInfo}
            />
          </TouchableOpacity>
        </Button>
      </View>
    );
  };

  renderScrollToBottomButton = () => (
    <TouchableOpacity
      onPress={() => this.componentList._root.scrollToEnd()}
      style={styles.scrollToBottomWrapper}>
      <Icon
        type="Ionicons"
        name="arrow-down"
        style={styles.scrollToBottomIcon}
      />
    </TouchableOpacity>
  );

  render() {
    const {messageModel, userModel, roomModel} = this.props;
    const {currentRoom} = roomModel;

    if (!messageModel.messages || !userModel || !currentRoom) {
      return <View />;
    }

    return (
      <MainLO>
        {this.renderTopBar()}

        <Content
          style={styles.chatContentWrapper}
          ref={c => (this.componentList = c)}>
          <ChatDisplaySection
            messages={messageModel.messages}
            userID={userModel.user_id}
          />
        </Content>

        {this.renderScrollToBottomButton()}

        {this.renderTextInputField()}

        <Footer>
          <FooterTab>
            <NavBar />
          </FooterTab>
        </Footer>
      </MainLO>
    );
  }
}

const mapStatesToProps = ({messageModel, userModel, roomModel, appModel}) => ({
  messageModel,
  userModel,
  roomModel,
  appModel,
});

export default connect(mapStatesToProps)(ChatWindow);
