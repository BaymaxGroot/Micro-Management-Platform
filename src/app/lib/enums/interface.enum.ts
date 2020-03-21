export enum Interface {
    /**
     * 上传图片
     */
    UploadImage = '/upload',
    /**
     * 登录
     */
    LoginEndPoint = '/login',
    /**
     * 商品管理
     */
    LoadProductCategoryListEndPoint = '/category/list',
    AddOrEditProductCategoryInfoEndPoint = '/category/set',
    RemoveProductCategoryEndPoint = '/category/remove',
    LoadProductListEndPoint = '/product/list',
    AddOrEditProductInfoEndPoint = '/product/set',
    RemoveProductEndPoint = '/product/delete',
    ChangeProductStatusEndPoint = '/product/status/change',
    ChangeProductStockEndPoint = '/product/stock/change',
    LoadProductWantedListEndPoint = '/load/good/wanted',
    /**
     * 订单管理
     */
    LoadOrderListEndPoint = "",
    LoadOrderAfterSaleEndPoint = "",
    LoadOrderEvaluationEndPoint = "",
    /**
     * 用户管理
     */
    LoadUserEndPoint = "/load/user",
    /**
     * 分销中心
     */
    /**
     * 内容管理
     */
}
