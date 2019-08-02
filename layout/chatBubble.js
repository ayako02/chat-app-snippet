import React, {Component} from "react";
import moment from "moment";
import {ScreenOrientation} from "expo";
import {Icon, Thumbnail} from "native-base";
import {routerRedux} from "dva/router";
import {connect} from "dva";
import * as Font from "expo-font";
import {Video} from "expo-av";
import RNUrlPreview from "react-native-url-preview";
import VideoPlayer from "expo-video-player";
import {
  View,
  Text,
  Image,
  Linking,
  Clipboard,
  ToastAndroid,
  TouchableWithoutFeedback,
} from "react-native";
import {getRestDomainXapi} from "../../helpers/utils";
import styles from "./chatBubble.style";
import Roboto from "../../Fonts/Roboto.ttf";
import RobotoMedium from "../../Fonts/Roboto_medium.ttf";

const path = getRestDomainXapi();

const replaceAvatar =
  "https://png.pngtree.com/svg/20161027/service_default_avatar_182956.png";
class ChatBubble extends Component {
  // async componentDidMount() {
  //   await Font.loadAsync({
  //     Roboto,
  //     RobotoMedium,
  //   });
  // }

  handleImgLoadEnd = () => (
    <View style={styles.incomingImgChatBubble}>
      <Icon
        type="FontAwesome"
        name="exclamation-circle"
        style={styles.errorIcon}
      />
    </View>
  );

  changeScreenOrientation = async () => {
    await ScreenOrientation.allowAsync(ScreenOrientation.Orientation.LANDSCAPE);
  };

  handleImagePress = () => {
    const {message} = this.props;

    if (message && message.content && message.msg_type === "FILE") {
      const {fileName, fileType, file_id, file_url} = message.content;

      this.props.dispatch({
        type: "messageInfoModel/PassMessageData",
        payload: {file_url, fileName},
      });
      this.props.dispatch(routerRedux.push("/imageViewer"));
    }
  };

  validateUrl = content => {
    const pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if (pattern.test(content)) {
      return true;
    }
    return false;
  };

  copyToClipboard = content => {
    if (content) {
      Clipboard.setString(content);
      ToastAndroid.show("复制成功", ToastAndroid.SHORT);
    }
  };

  generateAvatar = (from_type, from_id, from_name) => {
    const {memberList} = this.props.userModel;
    const {users, visitors} = memberList;

    let avatarUrl;
    let userObject;

    if (from_type === "agent") {
      if (users) {
        userObject = users.find(x => x.user_id === from_id);
        if (userObject.avatar) {
          avatarUrl = `${path}${userObject.avatar}`;
        } else {
          avatarUrl = replaceAvatar;
        }
      }
    } else if (from_type === "visitor") {
      if (visitors) {
        userObject = visitors.find(x => x._id === from_id);
        avatarUrl = replaceAvatar;
      }
    }

    return avatarUrl;
  };

  generateSenderAvatar = () => {
    let avatar;
    const senderAvatar = this.props.userModel.avatar;

    if (senderAvatar) {
      avatar = `${path}${this.props.userModel.avatar}`;
    } else {
      avatar = replaceAvatar;
    }

    return avatar;
  };

  render() {
    const {message, userID} = this.props;

    const user_id = userID;

    if (message) {
      const {
        created_at = "",
        updated_at = "",
        deleted_at = "",
        room_id = "",
        asset_id = "",
        msg_cat = "",
        msg_type = "",
        content = "",
        from_id = "",
        from_name = "",
        from_type = "agent",
      } = message;

      const date = moment(created_at).format("LT");

      if (msg_type === "TEXT") {
        const urlValidation = this.validateUrl(content);

        if (user_id === from_id) {
          // LINK SENT
          if (urlValidation) {
            return (
              <View style={styles.outgoingMainWrapper}>
                <Thumbnail small source={{uri: this.generateSenderAvatar()}} />
                <View style={styles.outgoingLinkChatBubble}>
                  <TouchableWithoutFeedback
                    delayLongPress={1000}
                    onLongPress={() => this.copyToClipboard(content)}>
                    <Text style={styles.linkText} numberOfLines={2}>
                      {content}
                    </Text>
                  </TouchableWithoutFeedback>
                  <RNUrlPreview
                    title
                    text={`TestLink ${content}`}
                    textContainerStyle={styles.urlTextContainer}
                    titleStyle={styles.urlTitle}
                    descriptionNumberOfLines={3}
                    descriptionStyle={styles.urlDesc}
                    containerStyle={styles.urlContainer}
                  />
                  <Text style={styles.outgoingTimeText}>{date}</Text>
                </View>
              </View>
            );
          }
          return (
            // TEXT SENT
            <View style={styles.outgoingMainWrapper}>
              <Thumbnail small source={{uri: this.generateSenderAvatar()}} />
              <TouchableWithoutFeedback
                delayLongPress={1000}
                onLongPress={() => this.copyToClipboard(content)}>
                <View style={styles.outgoingTextChatBubble}>
                  <Text style={styles.outgoingMsgText}>{content}</Text>
                  <Text style={styles.outgoingTimeText}>{date}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          );
        }
        {
          if (urlValidation) return null;

          // TEXT RECEIVED
          return (
            <View style={styles.incomingMainWrapper}>
              <Thumbnail
                small
                // source={{
                //   uri: this.generateAvatar(from_type, from_id, from_name),
                // }}
                source={{uri: replaceAvatar}}
              />
              <TouchableWithoutFeedback
                delayLongPress={1000}
                onLongPress={() => this.copyToClipboard(content)}>
                <View style={styles.incomingTextChatBubble}>
                  <Text style={styles.nameText}>{from_name}</Text>
                  <Text style={styles.incomingMsgText}>{content}</Text>
                  <Text style={styles.incomingTimeText}>{date}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          );
        }
      } else if (msg_type === "LINK") {
        // LINK RECEIVED
        return (
          <View style={styles.incomingMainWrapper}>
            <Thumbnail
              small
              // source={{
              //   uri: this.generateAvatar(from_type, from_id),
              // }}
              source={{uri: replaceAvatar}}
            />

            <View style={styles.incomingLinkChatBubble}>
              <Text style={styles.nameText}>{from_name}</Text>
              <TouchableWithoutFeedback
                delayLongPress={1000}
                onLongPress={() => this.copyToClipboard(content.url)}>
                <Text style={styles.linkTextInverted} numberOfLines={2}>
                  {content.url}
                </Text>
              </TouchableWithoutFeedback>
              <RNUrlPreview
                title
                text={`TestLink ${content.url}`}
                textContainerStyle={styles.urlTextContainer}
                titleStyle={styles.urlTitleInverted}
                descriptionNumberOfLines={3}
                descriptionStyle={styles.urlDescInverted}
                containerStyle={styles.urlContainer}
              />
              <Text style={styles.incomingTimeText}>{date}</Text>
            </View>
          </View>
        );
      } else if (msg_type === "FILE") {
        if (content) {
          const {
            fileName,
            fileType,
            file_id,
            file_url,
            thumbnail_url,
          } = content;

          // WHAT YOU SENT
          if (user_id === from_id) {
            // Load Image
            if (
              fileType === "image/jpeg" ||
              fileType === "image/jpg" ||
              fileType === "image/png"
            ) {
              return (
                <View style={styles.outgoingMainWrapper}>
                  <Thumbnail
                    small
                    source={{uri: this.generateSenderAvatar()}}
                  />

                  <TouchableWithoutFeedback onPress={this.handleImagePress}>
                    <View style={styles.outgoingImgChatBubble}>
                      <Image
                        onLoadEnd={this.handleImgLoadEnd}
                        source={{uri: file_url}}
                        style={styles.outgoingImg}
                        resizeMode="cover"
                      />
                      <Text style={styles.imgTimeText}>{date}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              );
            }

            // Load PDF
            if (fileType === "application/pdf") {
              return (
                <View style={styles.outgoingMainWrapper}>
                  <Thumbnail
                    small
                    source={{uri: this.generateSenderAvatar()}}
                  />
                  <TouchableWithoutFeedback
                    onPress={() => {
                      Linking.openURL(file_url);
                    }}>
                    <View style={styles.outgoingTextChatBubble}>
                      <View style={styles.fileNameWrapper}>
                        <Icon
                          type="Ionicons"
                          name="document"
                          style={styles.fileIcon}
                        />
                        <Text style={styles.outgoingMsgText}>{fileName}</Text>
                      </View>
                      <Text style={styles.outgoingTimeText}>{date}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              );
            }

            // Load Video
            if (fileType === "video/mp4") {
              return (
                <View style={styles.outgoingMainWrapper}>
                  <Thumbnail
                    small
                    source={{uri: this.generateSenderAvatar()}}
                  />
                  <View style={styles.outgoingImgChatBubble}>
                    <Video
                      source={{uri: file_url}}
                      rate={1.0}
                      volume={1.0}
                      isMuted={false}
                      resizeMode="cover"
                      shouldPlay={false}
                      isLooping
                      useNativeControls
                      style={styles.outgoingImg}
                    />
                    <Text style={styles.outgoingTimeText}>{date}</Text>
                  </View>
                </View>
              );
            }

            // Load others

            return (
              <View style={styles.outgoingMainWrapper}>
                <Thumbnail small source={{uri: this.generateSenderAvatar()}} />
                <View style={styles.outgoingNotSupportedChatBubble}>
                  <View style={styles.NotSupportedBubbleErrorMessageWrapper}>
                    <Icon
                      type="Ionicons"
                      name="information-circle-outline"
                      style={styles.NotSupportedBubbleErrorIcon}
                    />
                    <Text style={styles.outgoingMsgText}>不支持此文件格式</Text>
                  </View>

                  <Text style={styles.outgoingMsgText}>
                    文件格式: {fileType}
                    {"\n"}
                    {"\n"}
                    文件名称：{fileName}
                    {"\n"}
                  </Text>

                  <Text style={styles.outgoingTimeText}>{date}</Text>
                </View>
              </View>
            );
          }

          // WHAT YOU RECEIVED

          // Load image
          if (
            fileType === "image/jpeg" ||
            fileType === "image/jpg" ||
            fileType === "image/png"
          ) {
            return (
              <View style={styles.incomingMainWrapper}>
                <Thumbnail
                  small
                  // source={{
                  //   uri: this.generateAvatar(from_type, from_id),
                  // }}
                  source={{uri: replaceAvatar}}
                />
                <TouchableWithoutFeedback onPress={this.handleImagePress}>
                  <View style={styles.incomingImgChatBubble}>
                    <Text style={styles.incomingImgBubbleName}>
                      {from_name}
                    </Text>
                    <Image
                      onLoadEnd={this.handleImgLoadEnd}
                      source={{uri: file_url}}
                      style={styles.incomingImg}
                      resizeMode="cover"
                    />
                    <Text style={styles.imgTimeTextInverted}>{date}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            );
          }

          // Load video
          if (fileType === "video/mp4") {
            return (
              <View style={styles.incomingMainWrapper}>
                <Thumbnail
                  small
                  // source={{
                  //   uri: this.generateAvatar(from_type, from_id),
                  // }}
                  source={{uri: replaceAvatar}}
                />
                <View style={styles.incomingImgChatBubble}>
                  <View style={styles.incomingImgChatBubbleWrapper}>
                    <Text style={styles.incomingImgBubbleName}>
                      {from_name}
                    </Text>
                    <Icon
                      type="Ionicons"
                      name="play-circle"
                      style={styles.mp4PlayIcon}
                    />
                  </View>

                  <Video
                    source={{uri: file_url}}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay={false}
                    isLooping
                    useNativeControls
                    style={styles.incomingImg}
                  />

                  {/* <VideoPlayer
                    videoProps={{
                      isLooping: true,
                      shouldPlay: false,
                      resizeMode: Video.RESIZE_MODE_CONTAIN,
                      source: {
                        uri: file_url,
                      },
                      // useNativeControls: true,
                      style: {
                        width: 200,
                        height: 200,
                      },
                    }}
                    style={styles.incomingImg}
                    // isPortrait={false}
                    switchToLandscape={() => console.log("landscape")}
                    playFromPositionMillis={0}
                  /> */}

                  <Text style={styles.imgTimeTextInverted}>{date}</Text>
                </View>
              </View>
            );
          }

          // Load pdf
          if (
            fileType === "application/pdf" ||
            fileType ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            return (
              <View style={styles.incomingMainWrapper}>
                <Thumbnail
                  small
                  // source={{
                  //   uri: this.generateAvatar(from_type, from_id),
                  // }}
                  source={{uri: replaceAvatar}}
                />
                <TouchableWithoutFeedback
                  onPress={() => {
                    Linking.openURL(file_url);
                  }}>
                  <View style={styles.incomingTextChatBubble}>
                    <Text style={styles.nameText}>{from_name}</Text>
                    <View style={styles.fileNameWrapper}>
                      <Icon
                        type="Ionicons"
                        name="document"
                        style={styles.fileIconInverted}
                      />
                      <Text style={styles.incomingMsgText}>{fileName}</Text>
                    </View>
                    <Text style={styles.incomingTimeText}>{date}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            );
          }
          return (
            <View style={styles.incomingMainWrapper}>
              <Thumbnail
                small
                // source={{
                //   uri: this.generateAvatar(from_type, from_id),
                // }}
                source={{uri: replaceAvatar}}
              />
              <View style={styles.incomingNotSupportedChatBubble}>
                <Text style={styles.nameText}>{from_name}</Text>
                <View style={styles.NotSupportedBubbleErrorMessageWrapper}>
                  <Icon
                    type="Ionicons"
                    name="information-circle-outline"
                    style={styles.NotSupportedBubbleErrorIconInverted}
                  />
                  <Text style={styles.incomingMsgText}>不支持此文件格式</Text>
                </View>

                <Text style={styles.incomingMsgText}>
                  文件格式: {fileType}
                  {"\n"}
                  {"\n"}
                  文件名称：{fileName}
                  {"\n"}
                </Text>

                <Text style={styles.incomingTimeText}>{date}</Text>
              </View>
            </View>
          );
        }
      }
    } else {
      // console.log({message});
    }
    return <View />;
  }
}

const mapStatesToProps = ({messageInfoModel, userModel}) => ({
  messageInfoModel,
  userModel,
});

export default connect(mapStatesToProps)(ChatBubble);
