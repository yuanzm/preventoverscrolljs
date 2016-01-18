# preventoverscrolljs

## 使用

### 页面布局
```
<body id="wrapper">
    <div id="container"></div>
</body>
```

### 引用组件
引用组件支持下面两种方式：
- clone之后直接拷贝引用`bin`文件夹下面的`preventoverscroll.min.js`
- 从npm下载安装
    + `npm install --save preventoverscrolljs`
    + var PreventOverScroll = require('preventoverscrolljs');

### 设置样式
不少人反馈用了这个组件之后不能滑动，其实是样式没有写好。
按照上面的布局，你的样式应该包含下面这段：
```
    html, body {
        width: 100%;
        height: 100%;
    }
    #container {
        height: 100%;
    }
```

### 实例化组件

```
var list = ['container'];
var prevent = new PreventOverScroll({
    list: list
});
```

### 区分安卓和IOS
因为安卓不支持原生的橡皮筋效果，而且安卓在div内的滑动效果很差，所以上述组件应该这样实例化：
```
var outer = (  isAndroid // do it yourself
             ? 'wrapper'
             : 'container' );
var list = [outer];
var prevent = new PreventOverScroll({
    list: list
});
```
### TODO
上面的实例化过程很愚笨，不够智能，还需要完善，但不马上完善一定是因为要考虑足够多的应用场景。