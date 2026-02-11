import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.157.0/examples/jsm/loaders/GLTFLoader.js';

class SceneManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // 添加轨道控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // 添加光源
        this.setupLights();

        // 添加基础网格
        this.addGrid();

        // 设置模型加载器
        this.loader = new GLTFLoader();

        // 绑定窗口调整事件
        window.addEventListener('resize', () => this.onWindowResize());

        // 绑定截图功能
        this.setupScreenshot();

        // 开始渲染循环
        this.animate();
    }

    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // 主方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // 设置阴影属性
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
    }

    addGrid() {
        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);
    }

    loadModel(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    this.scene.add(model);
                    resolve(model);
                },
                undefined,
                (error) => reject(error)
            );
        });
    }

    setupScreenshot() {
        const screenshotBtn = document.getElementById('screenshot-btn');
        screenshotBtn.addEventListener('click', () => {
            const dataUrl = this.renderer.domElement.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'scene-screenshot.png';
            link.href = dataUrl;
            link.click();
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// 创建场景管理器实例
const sceneManager = new SceneManager();

// 导出场景管理器实例供其他模块使用
export default sceneManager;
