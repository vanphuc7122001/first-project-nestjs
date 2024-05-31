# Explain

Explain the meaning of middleware, exception filters, pipes, guards, interceptors, and custom decorators.

## Middlewares

Middleware thường nó sẻ xử lý logic trước khi vào controller (nếu logic đúng thì next, nếu sai thì throw ra error) or là biến đổi dử liệu trước khi vào controller or ghi log hệ thống

## Exception filter

Nó sẻ giống error handling lổi toàn cục và có thể custom xử lý lổi và trả về theo các dạng định nghỉa trước ví dụ như các dạng lổi: 422(lổi form) , 401(Jwt expired), 403(không có quyền truy cập vào tài nguyên),... trả về các dạng lổi chung như thế sẻ làm cho FE dể dàng handle error hơn.

```ts
    @Get()
    async findAll() {
    try {
        await this.service.findAll()
    } catch (error) {
        throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'This is a custom message',
        }, HttpStatus.FORBIDDEN, {
        cause: error
        });
    }
    }
```

## Pipe

Thường nó sẻ được dùng cho validation data có đúng format(ví dụ như đúng kiểu dử liệu) đã được định nghĩa trước đó hay không. và nó củng có thể biến đổi dử liệu

## Guard

Guard này nó củng giống như middleware nhưng mà nó sẻ được dùng cho authentication và authorization

### Usage

```ts
    @UseGuards(LocalAuthGuard)
    @Post("login")
    async login(@Req() req) {
        return this._authService.adminLogin(req.user);
    }
```

## Interceptor

Interceptor là xử lý logic trước khi request hoặc là sau respone nó củng có thể dùng để bắt các lổi để quăng ra các dạng lổi hợp lý ví dụ như axios bên react có 1 cái interceptor bên respone err dùng để bắt khi nào người dùng gửi request lên mà hết hạn access token thì interceptor này nó sẻ bắt đúng status là 401 và message là jwt expired thì interceptor này sẻ gọi vào api refresh token để renew lại access token mới và sau đó nó sẻ gọi lại cái api mà người dùng gọi lúc access token hết hạn.

### Usage

```ts
this.instance.interceptors.response.use(
  (response) => {
    const { url } = response.config;
    if (url === URL_LOGIN || url === URL_REGISTER) {
      const data = response.data as AuthResponse;
      this.accessToken = data.data.access_token;
      this.refreshToken = data.data.refresh_token;
      setAccessTokenToLS(this.accessToken);
      setRefreshTokenToLS(this.refreshToken);
      setProfileToLS(data.data.user);
    } else if (url === URL_LOGOUT) {
      this.accessToken = "";
      this.refreshToken = "";
      clearLS();
    }
    return response;
  },
  (error: AxiosError) => {
    // Chỉ toast lỗi không phải 422 và 401
    if (
      ![
        HttpStatusCode.UnprocessableEntity,
        HttpStatusCode.Unauthorized,
      ].includes(error.response?.status as number)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any | undefined = error.response?.data;
      const message = data?.message || error.message;
      toast.error(message);
    }

    // Lỗi Unauthorized (401) có rất nhiều trường hợp
    // - Token không đúng
    // - Không truyền token
    // - Token hết hạn*

    // Nếu là lỗi 401
    if (
      isAxiosUnauthorizedError<
        ErrorResponse<{ name: string; message: string }>
      >(error)
    ) {
      const config = error.response?.config || { headers: {}, url: "" };
      const { url } = config;
      // Trường hợp Token hết hạn và request đó không phải là của request refresh token
      // thì chúng ta mới tiến hành gọi refresh token
      if (isAxiosExpiredTokenError(error) && url !== URL_REFRESH_TOKEN) {
        // Hạn chế gọi 2 lần handleRefreshToken
        this.refreshTokenRequest = this.refreshTokenRequest
          ? this.refreshTokenRequest
          : this.handleRefreshToken().finally(() => {
              // Giữ refreshTokenRequest trong 10s cho những request tiếp theo nếu có 401 thì dùng
              setTimeout(() => {
                this.refreshTokenRequest = null;
              }, 10000);
            });
        return this.refreshTokenRequest.then((access_token) => {
          // Nghĩa là chúng ta tiếp tục gọi lại request cũ vừa bị lỗi
          return this.instance({
            ...config,
            headers: { ...config.headers, authorization: access_token },
          });
        });
      }

      // Còn những trường hợp như token không đúng
      // không truyền token,
      // token hết hạn nhưng gọi refresh token bị fail
      // thì tiến hành xóa local storage và toast message

      clearLS();
      this.accessToken = "";
      this.refreshToken = "";
      toast.error(
        error.response?.data.data?.message || error.response?.data.message
      );
      // window.location.reload()
    }
    return Promise.reject(error);
  }
);
```

## Custom decorator

Custom decorator dùng để gán vào object request 1 key nửa ví dụ như là khi handle login trong passport strategy nếu validate đúng thì nó sẻ tự gán req.user = user và mình muốn lấy ra user này mình có 2 cách cách 1 là dùng @Req() req : Request 'từ express' còn cách 2 là custom decorator.

### Usage

```ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  }
);
```
