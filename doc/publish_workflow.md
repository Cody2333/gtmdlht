##部署到leancloud上的操作流程
<br>
1.首先确认是否安装avoscloud，如果没有的话执行  
<br>
```npm install -g avoscloud-code```  
<br>
2.若已安装avoscloud，检查是否已添加对应的app:  
<br>
```avoscloud app list```  
<br>
3.如果没有要部署的app,将目标app添加进来:  
<br>
```avoscloud add <name> <app id>```  
<br>
期间若要输入app key请到[leancloud控制台->设置->应用key] 查看  
<br>
4.若已有app,将当前的app切换至目标app:  
<br>
```avoscloud checkout <app name>```  
<br>
5.部署到开发环境:  
<br>
```avoscloud deploy```  
<br>
6.部署到生产环境(注意：要先部署到开发环境才能再部署到生产环境,不能跳过前一步):  
<br>
```avoscloud publish```  
<br>
  
####第1步以后的操作需在src目录下执行