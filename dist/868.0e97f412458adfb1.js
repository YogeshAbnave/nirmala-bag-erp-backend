"use strict";(self.webpackChunknector_farm=self.webpackChunknector_farm||[]).push([[868],{8868:(T,m,s)=>{s.r(m),s.d(m,{DashboardModule:()=>r});var g=s(6895),l=s(2019),e=s(1571),h=s(6043),p=s(529),u=s(2340),v=s(1627);class o{constructor(t,i,c){this.httpClient=t,this._httpService=i,this._commonService=c,this.BASE_URL=u.N.API_URL}getAllCompletedShipments(t){const i=`${this.BASE_URL}/api/user/getAll`,c=new p.WM({"Content-Type":"application/json",Authorization:`Bearer ${this._commonService.getSession().token}`});return this.httpClient.post(i,t,{headers:c})}getAllActiveShipments(t){return this._httpService.POST("/users/get-all-active-Shipments?access_token="+this._commonService.getSession().token,t)}getAllShippingManagers(t){return this._httpService.POST("/users/get-all-user-management?access_token="+this._commonService.getSession().token,t)}}o.\u0275fac=function(t){return new(t||o)(e.LFG(p.eN),e.LFG(v.O),e.LFG(h.v))},o.\u0275prov=e.Yz7({token:o,factory:o.\u0275fac,providedIn:"root"});var S=s(7876);const A=function(n){return{close:n}},Z=function(){return["/dashboard"]},f=function(){return["/user-management"]};class d{constructor(t,i,c){this._commonService=t,this._dashboardService=i,this._httpService=c,this.toggle=!1}ngOnInit(){this.getAllCompletedShipment(),this._commonService.aClickedEvent.subscribe(t=>{this.toggle=!this.toggle})}getAllCompletedShipment(){let t={userId:this._commonService.getUserId(),platform:"admin"};this._dashboardService.getAllCompletedShipments(t).subscribe(i=>{},i=>{})}getAllActiveShipment(){let t={customerAdminId:this._commonService.getUserId()};this._dashboardService.getAllActiveShipments(t).subscribe(i=>{this.allActiveShipment=i.message},i=>{})}getAllShippingManager(){let t={customerAdminId:this._commonService.getUserId()};this._dashboardService.getAllShippingManagers(t).subscribe(i=>{this.allShippingManagers=i.message.shippingManagers},i=>{})}change(){this.toggle=!this.toggle}}d.\u0275fac=function(t){return new(t||d)(e.Y36(h.v),e.Y36(o),e.Y36(v.O))},d.\u0275cmp=e.Xpm({type:d,selectors:[["app-dashboard"]],decls:66,vars:10,consts:[[1,"sidebar",3,"ngClass"],[1,"admin-name-toggle"],[1,"home-content",3,"click"],[1,"bx","bx-menu"],[1,"admin-name-side-menu"],[2,"display","flex","align-items","center"],["src","../../../assets/img/slider.png",2,"margin-left","-50px"],[1,"nav-links"],["routerLinkActive","active",3,"routerLink"],["src","../../../assets/img/dashboard.svg"],[1,"link_name"],["src","../../../assets/img/shipping-managers.svg"],[1,"home-section"],[1,"container-fluid","prl-0"],[1,"row"],[1,"col-lg-12"],[1,"main-content"],[1,"container-fluid"],[1,"row","mt-5"],[1,"col-lg-4"],[1,"ship-mng"],[1,"col-12","text-center","icon-pos"],["src","../../../assets/img/shiping.svg","alt",""],[1,"col-12"],[1,"dash-box-content"],[1,"m-0"],[1,"active-shipment"],["src","../../../assets/img/shiping1.svg","alt",""],[1,"com-shipment"],[1,"row","d-flex","align-items-center"],["src","../../../assets/img/shiping2.svg","alt",""]],template:function(t,i){1&t&&(e.TgZ(0,"div",0)(1,"div",1)(2,"div",2),e.NdJ("click",function(){return i.change()}),e._UZ(3,"i",3),e.qZA(),e.TgZ(4,"div",4)(5,"span",5)(6,"b"),e._UZ(7,"img",6),e._uU(8,"Nector Farm"),e.qZA()()()(),e.TgZ(9,"ul",7)(10,"li")(11,"a",8)(12,"i"),e._UZ(13,"img",9),e.qZA(),e.TgZ(14,"span",10),e._uU(15,"Dashboard"),e.qZA()()(),e.TgZ(16,"li")(17,"a",8)(18,"i"),e._UZ(19,"img",11),e.qZA(),e.TgZ(20,"span",10),e._uU(21,"User Management"),e.qZA()()()()(),e.TgZ(22,"section",12)(23,"div",13)(24,"div",14)(25,"div",15),e._UZ(26,"app-header"),e.qZA()()(),e.TgZ(27,"div",16)(28,"div",17)(29,"div",18)(30,"div",19)(31,"div",20)(32,"div",14)(33,"div",21),e._UZ(34,"img",22),e.qZA(),e.TgZ(35,"div",23)(36,"div",24)(37,"h4")(38,"strong"),e._uU(39),e.qZA()(),e.TgZ(40,"p",25),e._uU(41,"Active Users"),e.qZA()()()()()(),e.TgZ(42,"div",19)(43,"div",26)(44,"div",14)(45,"div",21),e._UZ(46,"img",27),e.qZA(),e.TgZ(47,"div",23)(48,"div",24)(49,"h4")(50,"strong"),e._uU(51),e.qZA()(),e.TgZ(52,"p",25),e._uU(53," Deactivated Users"),e.qZA()()()()()(),e.TgZ(54,"div",19)(55,"div",28)(56,"div",29)(57,"div",21),e._UZ(58,"img",30),e.qZA(),e.TgZ(59,"div",23)(60,"div",24)(61,"h4")(62,"strong"),e._uU(63),e.qZA()(),e.TgZ(64,"p",25),e._uU(65," Total Users"),e.qZA()()()()()()()()()()),2&t&&(e.Q6J("ngClass",e.VKq(6,A,i.toggle)),e.xp6(11),e.Q6J("routerLink",e.DdM(8,Z)),e.xp6(6),e.Q6J("routerLink",e.DdM(9,f)),e.xp6(22),e.Oqu(i.allShippingManagers),e.xp6(12),e.Oqu(i.allActiveShipment),e.xp6(12),e.Oqu(i.allCompletedShipment))},dependencies:[g.mk,S.G,l.rH,l.Od]});const U=[{path:"",component:d,data:{title:"Dashboard - Nector Farm"}}];class a{}a.\u0275fac=function(t){return new(t||a)},a.\u0275mod=e.oAB({type:a}),a.\u0275inj=e.cJS({imports:[l.Bz.forChild(U),l.Bz]});var b=s(4772);class r{}r.\u0275fac=function(t){return new(t||r)},r.\u0275mod=e.oAB({type:r}),r.\u0275inj=e.cJS({imports:[g.ez,b.m,a]})}}]);