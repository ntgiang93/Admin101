import i18n from "i18next";
import HttpApi from "i18next-http-backend";
// Bindings for React: allow components to
// re-render when language changes.
import { initReactI18next } from "react-i18next";

i18n
    //user backend detected language
    .use(HttpApi)
  // Add React bindings as a plugin.
  .use(initReactI18next)
  // Initialize the i18next instance.
  .init({
    // Config options

    // Specifies the default language (locale) used
    // when a user visits our site for the first time.                  
    lng: "vi",

    // Fallback locale used when a translation is
    // missing in the active locale.
    fallbackLng: "vi",

    // Enables useful output in the browser’s
    // dev console.
    debug: true,

    // Normally, we want `escapeValue: true` as it
    // ensures that i18next escapes any code in
    // translation messages, safeguarding against
    // XSS (cross-site scripting) attacks. However,
    // React does this escaping itself, so we turn 
    // it off in i18next.
    interpolation: {
      escapeValue: false,
    },

    // Translation messages. Add any languages
    // you want here.
    // resources: {
    //   // English
    //   en: {
    //     // `translation` is the default namespace.
    //     // More details about namespaces shortly.
    //     translation: {
    //         welcome_back: "Welcome back!",
    //         account: "Account",
    //         password: "Password",
    //         submit: "Submit",
    //         forgot_password: "Forgot password?",
    //         no_account: "No account yet? Please contact admin",
    //         login: "Login",
    //     },
    //   },
    //   // Vietnamese
    //   vi: {
    //     translation: {
    //         welcome_back: "Chào mừng bạn trở lại!",
    //         account: "Tài khoản",
    //         password: "Mật khẩu",
    //         submit: "Đăng nhập",
    //         forgot_password: "Quên mật khẩu?",
    //         no_account: "Chưa có tài khoản? Vui lòng liên hệ admin",
    //         login: "Đăng nhập",
    //     },
    //   },
    // },
  });

export default i18n;