let scene, camera, renderer, controls, labelRenderer;
let currentPanorama = null;
const panoramas = [];
let isEditMode = false;
let currentSceneIndex = 0;
let currentAnnotations = [];
let activeAnnotation = null;

// 初始化CSS2D渲染器
function initLabelRenderer() {
    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    document.getElementById('container').appendChild(labelRenderer.domElement);
}

// 创建文字标注
function createTextLabel(text, position) {
    const label = document.createElement('div');
    label.className = 'annotation';
    label.contentEditable = true;
    label.textContent = text;
    
    const labelObj = new THREE.CSS2DObject(label);
    labelObj.position.copy(position);
    scene.add(labelObj);
    
    // 保存标注
    currentAnnotations.push({
        type: 'text',
        content: text,
        position: position,
        element: labelObj
    });
    
    return labelObj;
}

// 创建箭头标注
function createArrowMarker(position) {
    const dir = new THREE.Vector3(1, 0, 0);
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1;
    const hex = 0xffff00;
    
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
    arrowHelper.position.copy(position);
    scene.add(arrowHelper);
    
    // 保存标注
    currentAnnotations.push({
        type: 'arrow',
        position: position,
        object: arrowHelper
    });
    
    return arrowHelper;
}

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.1);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    document.getElementById('container').appendChild(renderer.domElement);

    // 添加OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    controls.addEventListener('change', () => {
        renderer.render(scene, camera);
    });

    // 窗口大小调整事件
    window.addEventListener('resize', onWindowResize);

    // 文件选择事件
    document.getElementById('file-input').addEventListener('change', handleFileSelect);

    // 初始化按钮
    initButtons();

    // 初始化CSS2D渲染器
    initLabelRenderer();

    // 开始动画循环
    animate();

    // 初始渲染
    renderer.render(scene, camera);
}

// 加载等距柱状投影全景图
function loadEquirectangular(image) {
    return new Promise((resolve) => {
        console.log('开始加载纹理:', image.name); // 调试日志
        const texture = new THREE.TextureLoader().load(URL.createObjectURL(image), (texture) => {
            console.log('纹理加载完成:', image.name); // 调试日志
            texture.needsUpdate = true;
            const geometry = new THREE.SphereGeometry(500, 60, 40);
            geometry.scale(-1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ 
                map: texture,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.y = Math.PI;
            
            // 强制渲染场景
            renderer.render(scene, camera);
            console.log('场景已渲染'); // 调试日志
            
            resolve(mesh);
        }, undefined, (error) => {
            console.error('加载纹理失败:', error);
            resolve(null);
        });
    });
}

// 加载立方体贴图全景图
function loadCubemap(images) {
    const loader = new THREE.CubeTextureLoader();
    const urls = Array.isArray(images) ? 
        images.map(img => URL.createObjectURL(img)) : 
        Array(6).fill(URL.createObjectURL(images));
    
    const texture = loader.load(urls, () => {
        texture.needsUpdate = true;
        renderer.render(scene, camera);
    });
    const geometry = new THREE.BoxGeometry(5, 5, 5); // 缩小立方体尺寸
    return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
        envMap: texture,
        side: THREE.BackSide,
        transparent: true,
        opacity: 1
    }));
}

// 加载全景图
async function loadPanorama(image) {
    try {
        if (currentPanorama) {
            scene.remove(currentPanorama);
        }

        const mode = document.querySelector('input[name="mode"]:checked').value;
        if (mode === 'equirectangular') {
            currentPanorama = await loadEquirectangular(image);
        } else {
            currentPanorama = loadCubemap(image);
        }

        if (currentPanorama) {
            scene.add(currentPanorama);
            controls.reset();
            
            // 确保相机在正确位置
            camera.position.set(0, 0, 0.1);
            camera.lookAt(0, 0, 0);
            
            // 强制渲染
            renderer.render(scene, camera);
            console.log('全景图加载完成并渲染');
            // 更新当前场景索引
            currentSceneIndex = panoramas.findIndex(p => 
                p.file === image || (Array.isArray(p.files) && p.files.includes(image))
            );
        } else {
            console.error('加载全景图失败');
            alert('加载全景图失败，请检查图片格式');
        }
    } catch (error) {
        console.error('加载全景图出错:', error);
        alert('加载全景图时出错: ' + error.message);
    }
}

// 处理文件选择
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    const thumbnailContainer = document.getElementById('thumbnail-container');
    const existingFiles = new Set(panoramas.map(p => 
        p.file ? p.file.name : p.files.map(f => f.name).join(',')
    ));

    // 根据模式处理文件
    const mode = document.querySelector('input[name="mode"]:checked').value;
    let addedCount = 0;
    if (mode === 'equirectangular') {
        // 等距柱状投影模式 - 单图
        files.forEach(file => {
            if (!file.type.match('image.*')) return;
            
            // 检查是否已存在同名文件
            if (!existingFiles.has(file.name)) {
                const panorama = {
                    file: file,
                    thumbnail: URL.createObjectURL(file),
                    mode: 'equirectangular'
                };
                panoramas.push(panorama);
                addedCount++;

                const thumbnail = createThumbnail(panorama);
                thumbnail.dataset.mode = panorama.mode;
                thumbnailContainer.appendChild(thumbnail);
            }
        });
        
        if (addedCount === 0) {
            alert('没有新增场景，所有图片都已存在');
        }
        
    } else {
        // 立方体贴图模式 - 需要6张图为一组
    const groups = [];
    if (files.length % 6 !== 0) {
        alert('立方体模式需要上传6的倍数张图片（每组6张）');
        return;
    }
    for (let i = 0; i < files.length; i += 6) {
        const group = files.slice(i, i + 6);
        groups.push(group);
    }

        groups.forEach(group => {
            const groupKey = group.map(f => f.name).join(',');
            if (!existingFiles.has(groupKey)) {
                const panorama = {
                    files: group,
                    thumbnail: URL.createObjectURL(group[0]), // 用第一张作为缩略图
                    mode: 'cubemap'
                };
                panoramas.push(panorama);
                addedCount++;

                const thumbnail = createThumbnail(panorama);
                thumbnail.dataset.mode = panorama.mode;
                thumbnailContainer.appendChild(thumbnail);
            }
        });

        if (addedCount === 0) {
            alert('没有新增场景，所有图片组都已存在');
        }

        // 自动加载第一个有效组
        if (panoramas.length > 0) {
            loadPanorama(panoramas[0].files);
        }
    }
}

// 创建缩略图
function createThumbnail(panorama) {
    const container = document.createElement('div');
    container.className = 'thumbnail-item';
    container.dataset.id = panorama.id; // 添加唯一标识
    
    // 缩略图
    const thumbnail = document.createElement('img');
    thumbnail.src = panorama.thumbnail || panorama.files[0].thumbnail;
    thumbnail.className = 'thumbnail';
        thumbnail.onclick = async () => {
            try {
                if (panorama.file) {
                    await loadPanorama(panorama.file);
                } else if (panorama.files) {
                    await loadPanorama(panorama.files);
                }
                document.getElementById('scene-title').textContent = panorama.name || '未命名场景';
            } catch (error) {
                console.error('加载全景图失败:', error);
                alert('加载全景图失败，请检查图片格式');
            }
    };
    
    // 名称输入
    const nameInput = document.createElement('input');
    nameInput.className = 'name-input';
    nameInput.placeholder = '场景名称';
    nameInput.value = panorama.name || '';
    nameInput.onchange = (e) => {
        panorama.name = e.target.value;
        if (panorama === panoramas.find(p => p.file === currentPanorama?.file)) {
            document.getElementById('scene-title').textContent = e.target.value;
        }
    };

    container.appendChild(thumbnail);
    container.appendChild(nameInput);
    return container;
}

// 删除当前场景
function deleteCurrentScene() {
    const currentIndex = panoramas.findIndex(p => 
        p.file === currentPanorama?.file || p.files === currentPanorama?.files
    );
    
    if (currentIndex === -1) return;

    // 移除全景图
    panoramas.splice(currentIndex, 1);
    
    // 更新缩略图
    const thumbnailContainer = document.getElementById('thumbnail-container');
    thumbnailContainer.children[currentIndex].remove();
    
    // 加载下一个场景或清空
    if (panoramas.length > 0) {
        const nextScene = panoramas[Math.min(currentIndex, panoramas.length-1)];
        if (nextScene.file) {
            loadPanorama(nextScene.file);
        } else if (nextScene.files) {
            loadPanorama(nextScene.files);
        }
    } else {
        scene.remove(currentPanorama);
        currentPanorama = null;
        document.getElementById('scene-title').textContent = '';
    }
}

// 切换场景
function switchScene(direction) {
    if (panoramas.length < 2) return;
    
    // 使用模运算确保循环切换
    currentSceneIndex = (currentSceneIndex + direction + panoramas.length) % panoramas.length;

    console.log('新场景索引:', currentSceneIndex); // 调试日志
    
    const panorama = panoramas[currentSceneIndex];
    console.log('加载场景:', panorama); // 调试日志

    // 强制重新加载场景
    if (panorama.file) {
        loadPanorama(panorama.file);
    } else if (panorama.files) {
        loadPanorama(panorama.files);
    }
    
    document.getElementById('scene-title').textContent = panorama.name || '未命名场景';
}



// 初始化按钮事件
function initButtons() {
    // 预览按钮
    document.getElementById('preview-btn').addEventListener('click', async () => {
        if (panoramas.length > 0) {
            const first = panoramas[0];
            try {
                if (first.file) {
                    await loadPanorama(first.file);
                } else if (first.files) {
                    await loadPanorama(first.files);
                }
            } catch (error) {
                console.error('预览失败:', error);
                alert('预览全景图失败，请检查图片格式');
            }
        }
    });

    // 编辑模式切换
    const editBtn = document.getElementById('edit-mode-btn');
    editBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;
        editBtn.classList.toggle('edit-mode');
        controls.enabled = !isEditMode;
    });

    // 删除按钮事件
    document.getElementById('delete-scene-btn').addEventListener('click', deleteCurrentScene);

    // 折叠/展开控制面板
    const controlsPanel = document.getElementById('controls');
    let isCollapsed = false;
    document.getElementById('toggle-ui-btn').addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        controlsPanel.classList.toggle('collapsed');
    });

    // 点击事件处理
    window.addEventListener('click', (e) => {
        if (!isEditMode) return;

        const mouse = new THREE.Vector2();
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            if (e.shiftKey) {
                createArrowMarker(point);
            } else {
                const text = prompt('请输入标注内容：');
                if (text) {
                    createTextLabel(text, point);
                }
            }
        }
    });
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 启动应用
init();
