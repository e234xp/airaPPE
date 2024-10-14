分成四層架構：參考 DDD 架構

1. interface
   第一層，去定義如何使用 interface，例如 http 的 interface, socket 的 interface。

2. app
   interface 可以使用，去實際去做動作的地方，也是把 domain 拼裝組合的地方。

3. domain
   商業邏輯重點，邏輯都會寫在這，由 app 去控制各動作。

4. spiderman
   底層建設，各層都可以使用的工具箱。
