<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
        新建图像生成
      </el-button>
    </div>

    <!-- 图像生成列表 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="type" label="类型" width="120">
        <template slot-scope="{row}">
          <el-tag>{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="style" label="风格" width="120" />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="预览图" width="120" align="center">
        <template slot-scope="{row}">
          <el-image
            style="width: 50px; height: 50px"
            :src="row.imageUrl"
            :preview-src-list="[row.imageUrl]"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" />
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDownload(row)">下载</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 新建/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="70%">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-width="100px">
        <el-form-item label="图像标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入图像标题" />
        </el-form-item>
        <el-form-item label="图像类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择图像类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图像尺寸" prop="size">
          <el-select v-model="temp.size" placeholder="请选择图像尺寸">
            <el-option
              v-for="item in sizeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图像风格" prop="style">
          <el-select v-model="temp.style" placeholder="请选择图像风格">
            <el-option
              v-for="item in styleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文字描述" prop="prompt">
          <el-input
            v-model="temp.prompt"
            type="textarea"
            :rows="4"
            placeholder="请输入详细的图像描述，包括场景、主体、风格等要素"
          />
        </el-form-item>
        <el-form-item label="参考图片">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :limit="1"
            accept="image/*"
          >
            <el-button size="small" type="primary">选择参考图片</el-button>
            <div slot="tip" class="el-upload__tip">可选择一张参考图片，帮助生成更准确的结果</div>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="temp.prompt" label="AI生成">
          <el-button type="primary" :loading="generating" @click="generateImage">
            生成图像
          </el-button>
        </el-form-item>
        <el-form-item v-if="temp.generatedImages && temp.generatedImages.length > 0" label="生成结果">
          <div class="generated-images">
            <div v-for="(image, index) in temp.generatedImages" :key="index" class="image-item">
              <el-image
                :src="image"
                fit="cover"
                @click="selectImage(image)"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
              <div class="image-actions">
                <el-radio v-model="temp.selectedImage" :label="image">选择</el-radio>
              </div>
            </div>
          </div>
          <div class="regenerate-button">
            <el-button type="primary" @click="regenerateImage">重新生成</el-button>
          </div>
        </el-form-item>
        <el-form-item v-if="temp.selectedImage" label="图层设置">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="文字图层" name="text">
              <div class="layer-list">
                <div v-for="(layer, index) in temp.textLayers" :key="'text'+index" class="layer-item">
                  <el-input v-model="layer.text" placeholder="输入文字内容" />
                  <el-select v-model="layer.font" placeholder="字体" size="small">
                    <el-option label="黑体" value="SimHei" />
                    <el-option label="宋体" value="SimSun" />
                    <el-option label="微软雅黑" value="Microsoft YaHei" />
                  </el-select>
                  <el-color-picker v-model="layer.color" size="small" />
                  <el-input-number v-model="layer.size" :min="12" :max="72" size="small" />
                  <div class="position-control">
                    <span>X:</span>
                    <el-input-number
                      v-model="layer.position.x"
                      :min="0"
                      :max="1000"
                      size="small"
                      @change="updatePreview"
                    />
                    <span>Y:</span>
                    <el-input-number
                      v-model="layer.position.y"
                      :min="0"
                      :max="1000"
                      size="small"
                      @change="updatePreview"
                    />
                  </div>
                  <el-button type="text" icon="el-icon-delete" @click="removeTextLayer(index)" />
                </div>
                <el-button type="text" icon="el-icon-plus" @click="addTextLayer">添加文字</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Logo图层" name="logo">
              <el-upload
                class="logo-upload"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleLogoChange"
              >
                <el-button size="small" type="primary">上传Logo</el-button>
              </el-upload>
              <div v-if="temp.logo" class="logo-preview">
                <img :src="temp.logo" alt="Logo预览">
                <el-slider v-model="temp.logoScale" :min="10" :max="100" />
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="preview-canvas">
            <div ref="canvasContainer" class="canvas-container">
              <canvas
                ref="previewCanvas"
              />
              <div
                v-for="(layer, index) in temp.textLayers"
                :key="'indicator-'+index"
                class="text-indicator"
                :style="{
                  left: layer.position.x + 'px',
                  top: layer.position.y + 'px',
                  cursor: draggingIndex === index ? 'grabbing' : 'grab'
                }"
                @mousedown.stop="startDrag($event, index)"
              >
                {{ layer.text || '文本' }}
              </div>
              <div
                v-if="temp.logo"
                class="logo-indicator"
                :style="{
                  left: temp.logoPosition.x + 'px',
                  top: temp.logoPosition.y + 'px',
                  cursor: isDraggingLogo ? 'grabbing' : 'grab'
                }"
                @mousedown.stop="startDrag($event, 'logo')"
              >
                <img :src="temp.logo" :style="{ width: temp.logoScale + '%' }">
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveData">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'ImageGeneration',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      dialogVisible: false,
      dialogTitle: '',
      generating: false,
      activeTab: 'text',
      temp: {
        id: undefined,
        title: '',
        type: '楼盘海报',
        size: 'square',
        style: 'modern',
        prompt: '',
        referenceImage: null,
        generatedImages: [],
        selectedImage: '',
        imageUrl: '',
        textLayers: [],
        logo: null,
        logoScale: 50,
        logoPosition: { x: 20, y: 20 }
      },
      typeOptions: [
        { label: '楼盘海报', value: '楼盘海报' },
        { label: '活动海报', value: '活动海报' },
        { label: '节日海报', value: '节日海报' },
        { label: '品牌形象', value: '品牌形象' }
      ],
      sizeOptions: [
        { label: '1:1 (800x800)', value: 'square' },
        { label: '16:9 (1600x900)', value: 'landscape' },
        { label: '9:16 (900x1600)', value: 'portrait' }
      ],
      styleOptions: [
        { label: '写实风格', value: 'realistic' },
        { label: '现代简约', value: 'modern' },
        { label: '中国传统', value: 'traditional' },
        { label: '水彩艺术', value: 'watercolor' }
      ],
      rules: {
        title: [{ required: true, message: '请输入图像标题', trigger: 'blur' }],
        prompt: [{ required: true, message: '请输入文字描述', trigger: 'blur' }]
      },
      draggingIndex: -1,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      isDraggingLogo: false
    }
  },
  watch: {
    'temp.selectedImage': {
      handler(val) {
        if (val) {
          // 使用nextTick确保DOM已更新
          this.$nextTick(() => {
            this.updatePreview()
          })
        }
      }
    },
    'temp.textLayers': {
      handler() {
        // 使用nextTick确保DOM已更新
        this.$nextTick(() => {
          this.updatePreview()
        })
      },
      deep: true
    },
    'temp.logoScale': {
      handler() {
        // 使用nextTick确保DOM已更新
        this.$nextTick(() => {
          this.updatePreview()
        })
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // 模拟API调用
      setTimeout(() => {
        this.list = [
          {
            id: 1,
            title: '春季园区活动海报',
            type: '活动海报',
            style: '现代简约',
            creator: '张三',
            createTime: '2024-03-20 10:30',
            imageUrl: 'https://picsum.photos/400/400'
          },
          {
            id: 2,
            title: '新楼盘开盘宣传',
            type: '楼盘海报',
            style: '写实风格',
            creator: '李四',
            createTime: '2024-03-19 15:20',
            imageUrl: 'https://picsum.photos/400/400?random=1'
          }
        ]
        this.total = 2
        this.listLoading = false
      }, 500)
    },
    handleCreate() {
      this.dialogTitle = '新建图像生成'
      this.temp = {
        id: undefined,
        title: '',
        type: '楼盘海报',
        size: 'square',
        style: 'modern',
        prompt: '',
        referenceImage: null,
        generatedImages: [],
        selectedImage: '',
        imageUrl: '',
        textLayers: [],
        logo: null,
        logoScale: 50,
        logoPosition: { x: 20, y: 20 }
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑图像'
      // 创建一个包含所有必要属性的默认对象
      const defaultTemp = {
        id: undefined,
        title: '',
        type: '楼盘海报',
        size: 'square',
        style: 'modern',
        prompt: '',
        referenceImage: null,
        generatedImages: [],
        selectedImage: '',
        imageUrl: '',
        textLayers: [],
        logo: null,
        logoScale: 50,
        logoPosition: { x: 20, y: 20 }
      }

      // 使用 Object.assign 合并默认值和行数据
      this.temp = Object.assign({}, defaultTemp, row)
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleImageChange(file) {
      this.temp.referenceImage = file.raw
    },
    handleDownload(row) {
      // 实现图片下载逻辑
      this.$message.success('开始下载')
    },
    handleDelete(row) {
      this.$confirm('确认删除该图像?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 实现删除逻辑
        this.$message.success('删除成功')
        this.getList()
      })
    },
    generateImage() {
      if (!this.temp.prompt) {
        this.$message.warning('请先输入文字描述')
        return
      }
      this.generating = true
      // 模拟AI生成图像，使用固定的seed确保图片不会变化
      setTimeout(() => {
        const timestamp = Date.now()
        this.temp.generatedImages = [
          `https://picsum.photos/seed/${timestamp}/800/800`,
          `https://picsum.photos/seed/${timestamp + 1}/800/800`,
          `https://picsum.photos/seed/${timestamp + 2}/800/800`,
          `https://picsum.photos/seed/${timestamp + 3}/800/800`
        ]
        this.generating = false
      }, 3000)
    },
    selectImage(image) {
      // 确保使用完全相同的URL
      const selectedUrl = image
      this.temp.selectedImage = selectedUrl
    },
    regenerateImage() {
      this.generateImage()
    },
    addTextLayer() {
      this.temp.textLayers.push({
        text: '',
        font: 'Microsoft YaHei',
        color: '#000000',
        size: 24,
        position: { x: 50, y: 50 }
      })
    },
    removeTextLayer(index) {
      this.temp.textLayers.splice(index, 1)
    },
    handleLogoChange(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.temp.logo = e.target.result
        this.updatePreview()
      }
      reader.readAsDataURL(file.raw)
    },
    startDrag(event, index) {
      if (index === undefined) {
        return
      }

      if (index === 'logo') {
        this.isDraggingLogo = true
        this.dragStartX = event.clientX - this.temp.logoPosition.x
        this.dragStartY = event.clientY - this.temp.logoPosition.y
      } else {
        if (!this.temp.textLayers[index]) {
          return
        }
        this.isDragging = true
        this.draggingIndex = index
        this.dragStartX = event.clientX - this.temp.textLayers[index].position.x
        this.dragStartY = event.clientY - this.temp.textLayers[index].position.y
      }

      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDrag)
    },

    onDrag(event) {
      if (!this.isDragging && !this.isDraggingLogo) return

      const canvasRect = this.$refs.canvasContainer.getBoundingClientRect()
      const x = Math.max(0, Math.min(event.clientX - this.dragStartX, canvasRect.width))
      const y = Math.max(0, Math.min(event.clientY - this.dragStartY, canvasRect.height))

      if (this.isDraggingLogo) {
        this.temp.logoPosition = { x, y }
      } else if (this.draggingIndex !== -1) {
        this.temp.textLayers[this.draggingIndex].position = { x, y }
      }
    },

    stopDrag() {
      if (this.isDragging || this.isDraggingLogo) {
        // 只在停止拖动时更新一次预览
        this.updatePreview()
      }

      this.isDragging = false
      this.isDraggingLogo = false
      this.draggingIndex = -1

      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
    },

    updatePreview() {
      if (!this.$refs.previewCanvas || !this.temp.selectedImage) {
        return
      }

      const canvas = this.$refs.previewCanvas
      const ctx = canvas.getContext('2d')

      const baseImage = new Image()
      baseImage.crossOrigin = 'Anonymous' // 添加跨域支持
      baseImage.onload = () => {
        canvas.width = baseImage.width
        canvas.height = baseImage.height
        ctx.drawImage(baseImage, 0, 0)

        // 绘制文字图层
        if (this.temp.textLayers && this.temp.textLayers.length > 0) {
          this.temp.textLayers.forEach(layer => {
            if (!layer.text) return
            ctx.font = `${layer.size}px ${layer.font}`
            ctx.fillStyle = layer.color
            ctx.fillText(layer.text, layer.position.x, layer.position.y)
          })
        }

        // 绘制Logo
        if (this.temp.logo) {
          const logo = new Image()
          logo.onload = () => {
            const scale = this.temp.logoScale / 100
            const width = logo.width * scale
            const height = logo.height * scale
            ctx.drawImage(logo, this.temp.logoPosition.x, this.temp.logoPosition.y, width, height)
          }
          logo.src = this.temp.logo
        }
      }
      baseImage.src = this.temp.selectedImage
    },
    saveData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (!this.temp.selectedImage) {
            this.$message.warning('请选择一张生成的图像')
            return
          }

          // 获取最终合成的图片
          // const canvas = this.$refs.previewCanvas
          // const finalImage = canvas.toDataURL('image/png')

          // 这里可以将finalImage保存到服务器
          this.$message.success('保存成功')
          this.dialogVisible = false
          this.getList()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
}

.generated-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .image-item {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 10px;

    .el-image {
      width: 100%;
      height: 200px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }

    .image-actions {
      margin-top: 10px;
      text-align: center;
    }
  }
}

.regenerate-button {
  text-align: center;
  margin-top: 20px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.layer-list {
  .layer-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;

    .el-input {
      width: 200px;
    }

    .el-select {
      width: 120px;
    }
  }
}

.preview-canvas {
  margin-top: 20px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 10px;

  .canvas-container {
    position: relative;

    canvas {
      max-width: 100%;
      height: auto;
    }

    .text-indicator {
      position: absolute;
      padding: 2px 4px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px dashed #409EFF;
      pointer-events: all;
      user-select: none;

      &:hover {
        border-style: solid;
      }
    }
  }
}

.position-control {
  display: flex;
  align-items: center;
  gap: 5px;

  .el-input-number {
    width: 80px;
  }

  span {
    color: #606266;
  }
}

.layer-item {
  .position-control {
    margin: 0 10px;
  }
}

.logo-preview {
  margin-top: 10px;

  img {
    max-width: 200px;
    max-height: 100px;
    margin-bottom: 10px;
  }
}

.logo-indicator {
  position: absolute;
  padding: 2px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px dashed #409EFF;
  pointer-events: all;
  user-select: none;

  &:hover {
    border-style: solid;
  }

  img {
    max-width: 100px;
    max-height: 100px;
    display: block;
  }
}
</style>
