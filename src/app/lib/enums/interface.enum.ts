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
    LoadOrderListEndPoint = "/order/list",
    LoadOrderAfterSaleEndPoint = "",
    LoadOrderEvaluationEndPoint = "",
    ChangeOrderDeliveryStatus = '/express/state/set',
    ChangeOrderAddress = '/express/info/set',
    /**
     * 用户管理
     */
    LoadUserEndPoint = "/load/user",
    DeleteUserEndPoint = '',
    AddOrEditUserEndPoint = '',

    /**
     * 分销中心
     */
    LoadDistributorListEndPoint = '/shop/list',
    AddDistributorEndPoint = '/shop/info/set',
    DeleteDistributorEndPoint = '/shop/delete',
    DistributorStatusSetEndPoint = '/shop/status/set',
    /**
     * 设置中心
     */
    SettingParamsEndPoint = '',
    LoadCarouselListEndPoint = '/banner/list',
    DeleteCarouselEndPoint = '/banner/delete',
    AddOrEditCarouselEndPoint = '/banner/info/set',

    LoadBlockerListEndPoint = '/cube/list',
    DeleteBlockerEndPoint = '/cube/delete',
    AddOrEditBlockerEndPoint = '/cube/info/set',
}
