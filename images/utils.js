// let locationHead = window.location.origin + '/' + window.location.pathname.split('/').filter(i => i != '')[0]


var trs_utils = function (urlPreFix) {
    var self = this;
    // this.urlPreFix = '';

    this.urlPreFix = urlPreFix || '';

    this.loadScriptCallbacks = {}


    // 1、请求一下用户信息
    //      若提示 trsnotlogin 表示未登录， 跳转采编登录页
    //      若能拿到数据，则提示登录成功


}

trs_utils.prototype._extends =
    Object.assign ||
    function (target) {
        for (let i = 1; i < arguments.length; i++) {
            let source = arguments[i]
            for (let key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key]
                }
            }
        }
        return target
    }


// 从url获取参数
trs_utils.prototype.getUrlParams = function (url) {
    // 通过 ? 分割获取后面的参数字符串
    let urlStr = url.split('?')[1]

    if (!urlStr || urlStr === '') {
        return false
    }

    urlStr = decodeURIComponent(urlStr)

    // 创建空对象存储参数
    let obj = {}
    // 再通过 & 将每一个参数单独分割出来
    let paramsArr = urlStr.split('&')
    for (let i = 0, len = paramsArr.length; i < len; i++) {
        // 再通过 = 将每一个参数分割为 key:value 的形式
        let arr = paramsArr[i].split('=')
        obj[arr[0]] = arr[1]
    }
    return obj
}

// obj转url参数
trs_utils.prototype.searchStringify = function (data) {
    var toString = ''
    for (var key in data) {
        if (!data[key]) {
            delete data.key
        } else {
            var obj = data[key]
            if (Array.isArray(obj)) {
                var arrayString = obj.join(',')
                toString += key + '=' + arrayString + '&'
            } else {
                toString += key + '=' + data[key] + '&'
            }
        }
    }
    return toString.substring(0, toString.length - 1).replace(/$/, '')
}


/**
 * 加载一个远程脚本
 * @param {String} src 一个远程脚本
 * @param {Function} callback 回调
 */

trs_utils.prototype.loadScript = function (src, callback) {
    var callbacks = this.loadScriptCallbacks

    const existingScript = document.getElementById(src)
    const cb = callback || (() => {
    })
    if (!existingScript) {
        callbacks[src] = []
        const $script = document.createElement('script')
        $script.src = src
        $script.id = src
        $script.async = 1
        document.body.appendChild($script)
        const onEnd = 'onload' in $script ? stdOnEnd.bind($script) : ieOnEnd.bind($script)
        onEnd($script)
    }

    callbacks[src].push(cb)

    function stdOnEnd(script) {
        script.onload = () => {
            this.onerror = this.onload = null
            callbacks[src].forEach((item) => {
                item(null, script)
            })
            delete callbacks[src]
        }
        script.onerror = () => {
            this.onerror = this.onload = null
            cb(new Error(`Failed to load ${src}`), script)
        }
    }

    function ieOnEnd(script) {
        script.onreadystatechange = () => {
            if (this.readyState !== 'complete' && this.readyState !== 'loaded') return
            this.onreadystatechange = null
            callbacks[src].forEach((item) => {
                item(null, script)
            })
            delete callbacks[src]
        }
    }
}


/**
 * 加载一个远程css
 */
trs_utils.prototype.loadCss = function (_params) {
    return new Promise((resolve, reject) => {

        const params = _params || {url: '', id: ''}

        if (document.getElementById(params.id)) {
            // eslint-disable-next-line callback-return
            return resolve()
        }

        let script = document.createElement('link')
        script.rel = 'stylesheet'
        // script.async = true;
        script.charset = 'utf-8'
        script.id = params.id
        script.href = params.url //这个代表的是script 的src
        script.onload = () => {
            resolve()
        }
        script.onerror = () => {
            reject()
        }
        document.head.appendChild(script)
    })
}


// 获取登录用户信息
trs_utils.prototype.getLoginUserInfo = function () {
    // console.log(this._axios)
    const userInfo = sessionStorage.getItem('ls.curUserInfo');
    if (sessionStorage.getItem('ls.curUserInfo')) {

        console.log('已登录', JSON.parse(sessionStorage.getItem('ls.curUserInfo')).TRUENAME)

        // userName.innerText = sessionStorage.getItem('ls.curUserInfo') ? JSON.parse(sessionStorage.getItem('ls.curUserInfo')).TRUENAME + ',您好' : ''
    }
    if (userInfo && userInfo !== 'undefined') {
        return JSON.parse(userInfo);
    }
    return _axios.get('/wcm/mlfcenter.do', {
        params: {
            methodname: 'getCurrUserInfo',
            serviceid: 'mlf_extuser',
        },
    }).then(data => {

        if (data) {
            // alert(data, 'getLoginUserInfo')
            sessionStorage.setItem('ls.curUserInfo', JSON.stringify(data))
            _axios.get('/wcm/mlfcenter.do', {
                params: {
                    methodname: 'getCurrUserJsessionid',
                    serviceid: 'mlf_extuser',
                },
            }).then((res) => {
                localStorage.setItem('JSESSIONID', res);

                console.log('登录成功', JSON.parse(sessionStorage.getItem('ls.curUserInfo')).TRUENAME)

                // let userName = document.getElementById('userName');
                // userName.innerText = sessionStorage.getItem('ls.curUserInfo') ? JSON.parse(sessionStorage.getItem('ls.curUserInfo')).TRUENAME + ',您好' : ''
            })
        }
    });
}
