<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
        上传文档
      </el-button>
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索文档"
        style="width: 200px; margin-left: 10px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.category"
        placeholder="文档分类"
        style="width: 130px; margin-left: 10px"
        class="filter-item"
      >
        <el-option
          v-for="item in categoryOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
    </div>

    <!-- 文档列表 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column prop="title" label="文档标题" min-width="200" />
      <el-table-column prop="category" label="分类" width="120">
        <template slot-scope="{row}">
          <el-tag>{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="format" label="格式" width="100">
        <template slot-scope="{row}">
          <el-tag :type="getFormatType(row.format)">{{ row.format }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="100" />
      <el-table-column prop="creator" label="上传人" width="120" />
      <el-table-column prop="createTime" label="上传时间" width="160" />
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleView(row)">查看</el-button>
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

    <!-- 上传对话框 -->
    <el-dialog :visible.sync="uploadDialogVisible" title="上传文档" width="500px">
      <el-form ref="uploadForm" :model="uploadForm" :rules="uploadRules" label-width="80px">
        <el-form-item label="文档分类" prop="category">
          <el-select v-model="uploadForm.category" placeholder="请选择分类">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文档上传" prop="files">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="uploadForm.files"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">支持PDF、Word、TXT、Markdown格式,单个文件不超过10MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">上传</el-button>
      </div>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog :visible.sync="previewDialogVisible" :title="previewTitle" width="70%">
      <div v-loading="previewLoading" class="preview-container">
        <iframe v-if="previewUrl" :src="previewUrl" frameborder="0" width="100%" height="600px" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'KnowledgeBase',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        category: ''
      },
      categoryOptions: [
        { label: '规章制度', value: '规章制度' },
        { label: '操作手册', value: '操作手册' },
        { label: '培训资料', value: '培训资料' },
        { label: '常见问题', value: '常见问题' }
      ],
      uploadDialogVisible: false,
      uploadForm: {
        category: '',
        files: []
      },
      uploadRules: {
        category: [{ required: true, message: '请选择文档分类', trigger: 'change' }],
        files: [{ required: true, message: '请选择上传文件', trigger: 'change' }]
      },
      uploading: false,
      previewDialogVisible: false,
      previewTitle: '',
      previewUrl: '',
      previewLoading: false
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
            title: '物业管理规章制度V2.0',
            category: '规章制度',
            format: 'PDF',
            size: '2.5MB',
            creator: '张三',
            createTime: '2024-03-20 10:30'
          },
          {
            id: 2,
            title: '客服工作操作手册',
            category: '操作手册',
            format: 'Word',
            size: '1.8MB',
            creator: '李四',
            createTime: '2024-03-19 15:20'
          }
        ]
        this.total = 2
        this.listLoading = false
      }, 500)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.uploadForm = {
        category: '',
        files: []
      }
      this.uploadDialogVisible = true
      this.$nextTick(() => {
        this.$refs['uploadForm'].clearValidate()
      })
    },
    handleFileChange(file, fileList) {
      this.uploadForm.files = fileList
    },
    handleUpload() {
      this.$refs['uploadForm'].validate(valid => {
        if (valid) {
          this.uploading = true
          // 模拟上传
          setTimeout(() => {
            this.uploading = false
            this.uploadDialogVisible = false
            this.$message.success('上传成功')
            this.getList()
          }, 1500)
        }
      })
    },
    handleView(row) {
      this.previewTitle = row.title
      this.previewLoading = true
      this.previewDialogVisible = true
      // 模拟加载预览URL
      setTimeout(() => {
        this.previewUrl = `https://example.com/preview/${row.id}`
        this.previewLoading = false
      }, 1000)
    },
    handleDownload(row) {
      this.$message.success('开始下载: ' + row.title)
    },
    handleDelete(row) {
      this.$confirm('确认删除该文档?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
        this.getList()
      })
    },
    getFormatType(format) {
      const typeMap = {
        'PDF': 'danger',
        'Word': 'primary',
        'TXT': 'info',
        'Markdown': 'success'
      }
      return typeMap[format] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
}

.preview-container {
  min-height: 600px;
}
</style>
