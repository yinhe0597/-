Here's a bilingual Chinese-English version of your README with clear section pairing for easy copying:

---
# 360°全景图查看器 / 360° Panorama Viewer  
一个基于Three.js的360°全景图查看器，支持等距柱状投影和立方体贴图两种模式。  
*A Three.js-based 360° panorama viewer supporting both equirectangular projection and cubemap modes.*

## 功能特点 / Features  
**多模式支持 / Multi-mode Support:**  
- 等距柱状投影模式（单张2:1全景图）  
  *Equirectangular projection mode (single 2:1 panorama image)*  
- 立方体贴图模式（6张立方体面图）  
  *Cubemap mode (6 cube face images)*  

**场景管理 / Scene Management:**  
- 支持多次导入不同场景  
  *Import multiple scenes*  
- 自动检测并跳过重复图片  
  *Automatically detects and skips duplicate images*  
- 可自定义场景名称  
  *Customizable scene names*  
- 删除指定场景  
  *Delete specific scenes*  

**交互功能 / Interactive Functions:**  
- 鼠标拖动查看全景  
  *Drag to rotate the view*  
- 场景缩略图预览  
  *Scene thumbnail preview*  
- 场景切换  
  *Switch between scenes*  

**编辑功能 / Editing Tools:**  
- 添加文字标注  
  *Add text annotations*  
- 添加箭头标记  
  *Add arrow markers*  

## 使用方法 / Usage  
### 基本操作 / Basic Operations  
**导入图片 / Import Images:**  
- 点击"导入"按钮选择图片文件  
  *Click the "Import" button to select image files*  
  - 等距柱状投影模式：选择单张2:1比例全景图  
    *Equirectangular mode: Choose a single 2:1 aspect ratio panorama*  
  - 立方体贴图模式：选择6张立方体面图（需按顺序）  
    *Cubemap mode: Select 6 cube face images (must be in order)*  

**查看全景 / View Panoramas:**  
- 鼠标拖动旋转视角  
  *Drag with the mouse to rotate the view*  
- 点击缩略图切换不同场景  
  *Click thumbnails to switch scenes*  

**编辑模式 / Edit Mode:**  
- 点击"编辑"按钮进入编辑模式  
  *Click the "Edit" button to enter edit mode*  
- 在场景中点击添加文字标注  
  *Click on the scene to add text annotations*  
- 按住Shift键点击添加箭头标记  
  *Hold Shift + Click to add arrow markers*  

### 高级功能 / Advanced Features  
**多次导入 / Multiple Imports:**  
- 可多次点击"导入"按钮添加新场景  
  *Click "Import" multiple times to add new scenes*  
- 系统会自动跳过已存在的图片  
  *The system automatically skips existing images*  

**场景管理 / Scene Management:**  
- 点击缩略图下方的输入框可修改场景名称  
  *Click the input field below thumbnails to rename scenes*  
- 点击"删除"按钮移除当前场景  
  *Click the "Delete" button to remove the current scene*  

**模式切换 / Mode Switching:**  
- 通过顶部单选按钮切换等距柱状投影/立方体贴图模式  
  *Toggle between Equirectangular/Cubemap modes via the radio buttons at the top*  
- 切换模式后需要重新导入图片  
  *Note: Re-import images after switching modes*  

## 技术说明 / Technical Details  
- 基于Three.js构建  
  *Built with Three.js*  
- 使用OrbitControls实现视角控制  
  *Uses OrbitControls for camera manipulation*  
- 支持WebGL渲染  
  *Supports WebGL rendering*  
- 响应式设计适配不同屏幕尺寸  
  *Responsive design for various screen sizes*  

## 注意事项 / Notes  
- 立方体贴图模式需要严格按照顺序上传6张图片  
  *Cubemap mode requires uploading 6 images in strict order*  
- 建议使用Chrome/Firefox等现代浏览器  
  *Recommended browsers: Chrome/Firefox or other modern browsers*  
- 大尺寸图片可能需要较长时间加载  
  *Large images may take longer to load*  
- 编辑模式下的标注目前不会自动保存  
  *Annotations in edit mode are not auto-saved (currently)*  

## 未来计划 / Roadmap  
- 添加标注保存功能  
  *Add annotation saving functionality*  
- 支持热点跳转  
  *Support hotspot navigation*  
- 增加VR模式支持  
  *Enable VR mode*  
- 优化移动端体验  
  *Optimize mobile experience*  

## 版本号 / Version  
V0.02.02  

## Bug反馈 / Bug Reports  
email: yhkjsj@foxmail.com  
---

This format maintains perfect alignment between Chinese and English content, making it easy to copy-paste while keeping both languages clearly paired. Let me know if you need any adjustments!
