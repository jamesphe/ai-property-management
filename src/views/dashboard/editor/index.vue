<template>
  <div class="dashboard-editor">
    <el-row :gutter="20">
      <!-- 快捷操作区 -->
      <el-col :span="24">
        <el-card>
          <div slot="header">
            <span>快捷操作</span>
          </div>
          <div class="quick-actions">
            <el-button type="primary" icon="el-icon-document">
              新建公告
            </el-button>
            <el-button type="success" icon="el-icon-picture">
              生成海报
            </el-button>
            <el-button type="warning" icon="el-icon-notebook-1">
              会议纪要
            </el-button>
            <el-button type="info" icon="el-icon-folder">
              知识库
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 我的内容 -->
      <el-col :span="16">
        <el-card>
          <div slot="header">
            <span>我的内容</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="我创建的" name="created">
              <el-table :data="myContent" style="width: 100%">
                <el-table-column prop="date" label="日期" width="180" />
                <el-table-column prop="type" label="类型" width="100" />
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="待处理" name="pending">
              <el-table :data="pendingContent" style="width: 100%">
                <el-table-column prop="date" label="日期" width="180" />
                <el-table-column prop="type" label="类型" width="100" />
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="action" label="操作" width="100">
                  <template>
                    <el-button type="text">处理</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <!-- 使用统计 -->
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>使用统计</span>
          </div>
          <div class="statistics">
            <div class="stat-item">
              <div class="stat-title">本月已生成内容</div>
              <div class="stat-number">56</div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="stat-title">本月已处理图片</div>
              <div class="stat-number">23</div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="stat-title">知识库贡献</div>
              <div class="stat-number">12</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'EditorDashboard',
  data() {
    return {
      activeTab: 'created',
      myContent: [
        { date: '2024-03-20 10:30', type: '公告', title: '小区停水通知', status: '已发布' },
        { date: '2024-03-19 15:20', type: '海报', title: '清明节活动宣传', status: '审核中' },
        { date: '2024-03-18 09:45', type: '纪要', title: '部门周会纪要', status: '草稿' }
      ],
      pendingContent: [
        { date: '2024-03-20 11:00', type: '公告', title: '业主投诉处理', action: '待回复' },
        { date: '2024-03-19 16:30', type: '海报', title: '修改宣传文案', action: '待修改' }
      ]
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        '已发布': 'success',
        '审核中': 'warning',
        '草稿': 'info'
      }
      return statusMap[status] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor {
  padding: 20px;

  .quick-actions {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
  }

  .statistics {
    .stat-item {
      padding: 15px 0;
      text-align: center;

      .stat-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }

      .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
    }
  }
}
</style>
