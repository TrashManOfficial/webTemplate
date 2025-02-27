// import qs from 'qs';
// import vueCookies from 'vue-cookies';

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';


// let loadingInstance;
var ENV = window.location.origin

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
const config = {
    baseURL: '',
    timeout: 60 * 1000, // Timeout
    withCredentials: true, // Check cross-site Access-Control
};
var _axios = axios.create(config);

/**
 * [getIdsUrl 获取ids地址]
 *
 * @return {[type]} [description]
 */
// function getIdsUrl() {
//     return new Promise(resolve => {
//         _axios.get('/wcm/mediacloud/queryTenantInfo/getIDSUrl').then(data => {
//             resolve(data);
//         });
//     });
// }
function getToken() {
    // alert('getToken')
    if (!JSON.parse(sessionStorage.getItem('ls.curUserInfo'))) return;
    var params = {
        serviceid: 'getToken',
        tenantId: JSON.parse(sessionStorage.getItem('ls.curUserInfo')).TENANTID,
    };
    axios.get('/wcm/mlfcenter.do', {
        params: params,
    }).then((data) => {
        Cookies.set('ls.userToken', JSON.stringify(data.data), 2 * 60 * 60);// token失效时间2小时
        localStorage.setItem('ls.userToken', JSON.stringify(data.data));
        location.reload();
    });
}

/**
 * [goToZsjLogin description] 进入登录页
 *
 * @param   {[String]}  addr  [addr description] ids登录页地址
 * @param   {[String]}  surl  [surl description]  wcm校验登录jsp地址
 * @param   {[boolean]} flag [flag description]
 *
 * @return  {[type]}        [return description]
 */
function goToZsjLogin(_env) {

    // 招商随行生产环境
    var ph = window.location.protocol + '//' + window.location.hostname;
    var curHref = window.location.href;
    curHref = curHref.substring(window.location.origin.length + 1);
    var redirectUrl = `${ph}/wcm/callback.do?href=${encodeURIComponent(curHref)}&web=true`;
    redirectUrl = encodeURIComponent(redirectUrl);

    var domain = '', client_id = '';

    switch (_env) {
        case "sit":
            domain = "https://nuc-hk-di1.sit.cmft.com:8085";
            client_id = "89c9cdc7d628262a447076b9b57a8410c2c3c9d3";

            break;
        case "uat": // 外网访问
            domain = "https://nuc-hk-st1.uat.cmft.com:8085";
            client_id = "f580d0261bfeb85208a3b960c7f806776b9da7dc";

            break;
        case "prod":
            domain = "https://nucs.cmft.com";
            client_id = "33d9be0a6affb92cb478181471f02a43773167cb";

            break;
    }

    // var authUrl = `${domain}/oauth/authorize?client_id=${client_id}&redirect_uri=${redirectUrl}&response_type=code`;
    // var url = `${domain}/oauth/coco/loginTwoAuth4pc.html?authUrl=${encodeURIComponent(authUrl)}`;

    var url = `${domain}/oauth/authorize?client_id=${client_id}&redirect_uri=${redirectUrl}&response_type=code`;

    console.log('招商随行未登录跳转', url);
    window.location.href = url;
}
function goToLoginPage(addr, surl) {
    let curUrl = window.location.href.split('#');
    // curUrl = curUrl[0] + 'login/login_tpl.html';
    curUrl = Base64.encode(curUrl[0]);
    curUrl = Base64.encode(surl + curUrl);
    window.location.href = addr + curUrl;
}

_axios.interceptors.request.use(
    function (config) {
        const token = Cookies.get('ls.userToken');
        if (!token) {
            getToken();
        } else {
            axios.defaults.headers['token'] = token.token;
        }
        // Do something before request is sent
        config.headers.formdata = '1';
        if (config.method === 'post' && config.headers['Content-Type'] !== 'application/json') { // post请求，formdata类型的数据不用转换为字符串
            if (Object.prototype.toString.call(config.data) !== '[object FormData]') {
                // config.data = qs.stringify(config.data); // post请求格式化数据
            } else {
                config.headers['Content-Type'] = 'multipart/form-data';
            }
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    },
);

// Add a response interceptor
_axios.interceptors.response.use(
    function (response) {
        // Do something with response data
        if (response.headers.trsnotlogin) {
            var addr = response.headers.idsloginurl;
            var surl = response.headers.surl.replace(/(\w+):\/\/([^/:]+)(:\d*)?/, window.location.origin);

            console.log("trsnotlogin", ENV, new Date().toLocaleString()) 

            // 根据域名判断所属环境
            if (ENV.includes('mfs-st1.uat.cm-worklink.com')) {
                goToZsjLogin('uat')
            } else if (ENV.includes('mfs.cmhk.com')) {
                goToZsjLogin('prod')
            } else {
                console.log("goToLoginPage") 
                goToLoginPage(addr, surl);
            }
        } else if (response.config.noError) {
            return response.data;
        } else if (response.data.ISSUCCESS && response.data.ISSUCCESS === 'false') {
            return response.data.DETAIL ? alert(response.data) : alert(response.data);
        } else if (response.data.status && response.data.status === '-1') {
            return alert(response.data);
        } else if (response.data.code === 1) {
            return response.data;
        } else if (response.data.code === '401') {
            getToken();
        } else if ((response.data.code && '' + response.data.code === '500') || (response.data.CODE && '' + response.data.CODE === '500')) {
            return alert(response.data);
        } else {
            return response.data;
        }
    },
    function (error) {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    error.message = '错误请求';
                    break;
                case 401:
                    error.message = '未授权，请重新登录';
                    break;
                case 403:
                    error.message = '拒绝访问';
                    break;
                case 404:
                    error.message = '请求错误，未找到该资源';
                    break;
                case 405:
                    error.message = '请求方法未允许';
                    break;
                case 408:
                    error.message = '请求超时';
                    break;
                case 500:
                    error.message = '服务端出错';
                    break;
                case 501:
                    error.message = '网络未实现';
                    break;
                case 502:
                    error.message = '网络错误';
                    break;
                case 503:
                    error.message = '服务不可用';
                    break;
                case 504:
                    error.message = '网络超时';
                    break;
                case 505:
                    error.message = 'http版本不支持该请求';
                    break;
                default:
                    error.message = `连接错误${error.response.status}`;
            }
        } else {
            // return alert('网络异常，请做好备份，待网络恢复后重新编辑');
            return alert('网络异常');
        }
        // Do something with response error
        return Promise.reject(error);
    },
);

// 直接绑window上
window.trsAxios = _axios;
