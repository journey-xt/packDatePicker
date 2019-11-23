import React, { PureComponent } from "react";
import styled from "styled-components";
import { DatePicker, Button } from "antd";
import { memoize } from "lodash";
import moment from "moment";
import TimePicker from "../TimePicker";
// import { transformMoment, transformTimeStamp } from "../utils";
import { matchTimeFormat } from "../utils/matchTimeFormat";

// 声明文件
import { Moment } from "moment/moment.d";
import { PickerValue } from "./typeing";
import { ValueType, ValueStatus } from "./enum";

const PackDataPick = styled(DatePicker)`
  width: 100%;
`;

const RenderTimeWarp = styled.div`
  padding-right: 50px;
  position: relative;
  .ant-btn {
    position: absolute;
    right: 0;
    top: 50%;
    margin-top: -12px;
  }
`;

// 声明组件Props类型
export interface SingleDatePickerProps {
  format?: string | string[];
  selectTodayAfter?: boolean;
  showTime?: boolean;
  valueStatus?: ValueStatus;
  defaultPickerValue?: Moment;
  showToday?: boolean;
  valueType?: ValueType;
  value?: string | number | Moment | Date;
  onChange?: (value?: PickerValue, ValueStatus?) => void;
  disabledDate?: (
    currentDate: Moment | undefined,
    valueStatus?: ValueStatus
  ) => boolean;
  disabledHours?: () => Array<number>;
  disabledMinutes?: (hour: number) => Array<number>;
}

// 声明组件State类型
type State = {
  currentDate: Moment;
  dateLayer: boolean;
  value?: string | number | Moment | Date;
};

class SingleDatePicker extends PureComponent<SingleDatePickerProps, State> {
  timeLayer: boolean;

  constructor(props) {
    super(props);
    this.timeLayer = false;
    this.state = {
      currentDate: moment(), // 当前时间
      value: props.value, // 内部维护 时间组件的值得
      dateLayer: false
    };
  }

  static getDerivedStateFromProps(props) {
    const { value } = props;
    if (value) {
      return { value };
    }
    return { value: undefined };
  }

  static defaultProps = {
    valueType: ValueType.TimeStamp,
    format: "YYYY-MM-DD",
    valueStatus: ValueStatus.Start,
    selectTodayAfter: true
  };

  // 不可选择时间回调
  disabledDate = (currentDate: Moment | undefined) => {
    const { disabledDate, selectTodayAfter, valueStatus } = this.props;
    // 传递外层API 禁用日期
    if (disabledDate && currentDate) {
      return disabledDate(currentDate, valueStatus);
    }
    if (selectTodayAfter) {
      const { currentDate: compareDate } = this.state;
      if (currentDate) {
        return currentDate.isBefore(compareDate, "day");
      }
      return false;
    }
    return false;
  };

  // 通过传入的 值 转成moment对象传递给组件
  transformValue = date => {
    const transformDate = moment(date);
    if (date && transformDate.isValid()) {
      return transformDate;
    }
    return undefined;
  };

  // 根据传递回来的 moment对象 取得 开始时间戳 和结束时间戳
  timeStampBack = (date: Moment | null, valueStatus?: ValueStatus) => {
    const { valueType } = this.props;
    if (valueType === ValueType.TimeStamp) {
      switch (valueStatus) {
        case ValueStatus.Start:
          return date ? date.startOf("day").valueOf() : undefined;
        case ValueStatus.End:
          return date ? date.endOf("day").valueOf() : undefined;
        default:
          return date ? date.valueOf() : undefined;
      }
    }
    return undefined;
  };

  // 时间变化回调
  onChange = (date: Moment | null, dateString?: string) => {
    const { valueType, valueStatus, onChange } = this.props;
    if (onChange) {
      switch (valueType) {
        case ValueType.TimeStamp:
          return onChange(this.timeStampBack(date, valueStatus), valueStatus);
        case ValueType.TimeString:
          return onChange(dateString, valueStatus);
        case ValueType.Moment:
        default:
          return onChange(date, valueStatus);
      }
    } else {
      this.setState({ value: date || undefined });
    }
  };

  // 添加额外的的页脚render
  // 需要选择 时分秒生成module
  renderExtraFooter = () => {
    const { format, disabledHours, disabledMinutes } = this.props;

    const timeFormat = this.matchTimeFormat(format);

    if (timeFormat) {
      const { value, currentDate } = this.state;

      return (
        <RenderTimeWarp>
          <TimePicker
            format={timeFormat}
            disabledHours={disabledHours}
            disabledMinutes={disabledMinutes}
            timePickerOnOpenChange={this.timePickOnOpenChange}
            datePickerOnOpenChange={this.onOpenChange}
            timeOnChange={this.timeOnChange}
            value={value || currentDate}
          />
          <Button size="small" type="primary" onClick={this.pickerConfirm}>
            确定
          </Button>
        </RenderTimeWarp>
      );
    }
    return null;
  };

  // 时间组件 数值变化回调
  timeOnChange = time => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(time);
    } else {
      this.setState({ value: time.valueOf() });
    }
  };

  // 组件确认按钮回调
  pickerConfirm = () => {
    this.setState({ dateLayer: false });
  };

  // 文档写的是 显示面板回调  但是貌似是 获取焦点和失去焦点回调
  onOpenChange = (status: boolean) => {
    if (this.timeLayer) {
      return;
    }
    this.setState({
      dateLayer: status,
      currentDate: moment()
    });
  };

  // 时间组件 面板回调
  timePickOnOpenChange = status => {
    this.timeLayer = status;
  };

  // 判断format 是否带有 时间选项
  matchTimeFormat = memoize((format: string) => {
    const match = matchTimeFormat(format);
    if (match && match[0]) {
      return match[0];
    }
    return null;
  });

  render() {
    const { value, dateLayer } = this.state;
    const { defaultPickerValue, showToday, format } = this.props;

    return (
      <PackDataPick
        format={format}
        value={this.transformValue(value)}
        onOpenChange={this.onOpenChange}
        onChange={this.onChange}
        disabledDate={this.disabledDate}
        defaultPickerValue={defaultPickerValue}
        showToday={showToday}
        renderExtraFooter={this.renderExtraFooter}
        open={dateLayer}
      />
    );
  }
}

export default SingleDatePicker;
