export enum Interface {
    /**
     * 上传图片
     */
    UploadImage = '/api/upload',
    /**
     * 登录
     */
    LoginEndPoint = '/api/login',
    /**
     * 商品管理
     */
    LoadProductCategoryListEndPoint = '/api/category/list',
    AddOrEditProductCategoryInfoEndPoint = '/api/category/set',
    RemoveProductCategoryEndPoint = '/api/category/remove',
    LoadProductListEndPoint = '/api/product/list',
    AddOrEditProductInfoEndPoint = '/api/product/set',
    RemoveProductEndPoint = '/api/product/delete',
    ChangeProductStatusEndPoint = '/api/product/status/change',
    ChangeProductStockEndPoint = '/api/product/stock/change',
    LoadProductWantedListEndPoint = '/api/load/good/wanted',

    LoadSpecifyListEndPoint = '/api/spec/list',
    AddOrModifySpecifyEndPoint = '/api/spec/info/set',
    DeleteSpecifyEndPoint = '/api/spec/delete',
    /**
     * 订单管理
     */
    LoadOrderListEndPoint = "/api/order/list",
    ChangeOrderDeliveryStatus = '/api/express/state/set',
    ChangeOrderAddress = '/api/express/info/set',
    ChangeMultiOrderDeliveryStatus = '/api/express/state/batch/set',
    PrintOrderEndPoint = '/api/download/excel',
    OrderRefundEndPoint = '/api/order/refund',

    LoadEvaluateListEndPoint = '/api/comment/list',
    ChangeEvaluateStatusEndPoint = '/api/comment/status/set',
    DeleteEvaluateEndPoint = '',

    LoadAccountRechargeOrderListEndPoint = '/api/purse/order/list',
    PrintAccountRechargeOrderEndPoint = '/api/download/purse/excel',
    /**
     * 用户管理
     */
    LoadUserEndPoint = "/api/user/list",
    LoadVIPListEndPoint = "/api/member/list",
    GenerateAccountDetailEndPoint = "/api/member/purse/log/id",
    DeleteUserEndPoint = '/api/delete/user',
    AddOrEditUserEndPoint = '/api/user/info',

    /**
     * 分销中心
     */
    LoadDistributorListEndPoint = '/api/shop/list',
    AddDistributorEndPoint = '/api/shop/info/set',
    DeleteDistributorEndPoint = '/api/shop/delete',
    DistributorStatusSetEndPoint = '/api/shop/status/set',
    /**
     * 设置中心
     */
    GetParamsEndPoint = '/api/setting/info',
    SettingParamsEndPoint = '/api/setting/info/set',
    LoadCarouselListEndPoint = '/api/banner/list',
    DeleteCarouselEndPoint = '/api/banner/delete',
    AddOrEditCarouselEndPoint = '/api/banner/info/set',

    LoadBlockerListEndPoint = '/api/cube/list',
    DeleteBlockerEndPoint = '/api/cube/delete',
    AddOrEditBlockerEndPoint = '/api/cube/info/set',

    LoadRecommendListEndPoint = '/api/home_cat/list',
    DeleteRecommendEndPoint = '/api/home_cat/delete',
    AddOrEditRecommendEndPoint = '/api/home_cat/info/set',

    LoadRechargeReduceListEndPoint = '/api/recharge/list',
    DeleteRechargeReduceEndPoint = '/api/recharge/delete',
    AddOrEditRechargeReduceEndPoint = '/api/recharge/info/set',

    LoadCarriageListEndPoint = '/api/carriage_rule/list',
    LoadCarriageShopListEndPoint = '/api/shop/list',
    LoadCarriageProductListEndPoint = '/api/product/list',
    DeleteCarriageEndPoint = '/api/carriage_rule/delete',
    AddOrEditCarriageEndPoint = '/api/carriage_rule/info/set',

    /**
     * 销售明细
     */
    SellOrderEndPoint = '/api/sales/info/id',
    SellEndPoint = '/api/order/list/shop/id',

    /**
     * 企业管理
     */
    EnterpriseListEndPoint = '/api/enterprise/list',
    EnterpriseAddOrEditEndPoint = '/api/enterprise/info/set',
    EnterpriseRemoveEndPoint = '/api/enterprise/delete',
    EnterpriseBuyRecordEndPoint = '/api/enterprise/id/recharge/log',
    EnterpriseRechargeLogEndPoint = '/api/enterprise/recharge/log/summary',
    EnterpriseRechargeListEndPoint = '/api/enterprise/employee/list/log/id',
    EnterpriseRechargeUploadEndPoint = '/api/enterprise/batch/import/employee',
    EnterpriseBatchRechargingEndPint = '/api/enterprise/batch/recharge',

    GeneratePhoneCodeEndPoint = '/api/send/verify/code',
}
