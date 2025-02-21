<template>
  <div class="dashboard-admin">
    <el-row :gutter="20">
      <!-- 数据概览卡片 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="data-overview">
            <div class="icon-wrapper blue">
              <i class="el-icon-document" />
            </div>
            <div class="data-info">
              <div class="data-title">今日生成内容</div>
              <div class="data-number">128</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="data-overview">
            <div class="icon-wrapper green">
              <i class="el-icon-picture" />
            </div>
            <div class="data-info">
              <div class="data-title">图片处理数</div>
              <div class="data-number">56</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="data-overview">
            <div class="icon-wrapper orange">
              <i class="el-icon-chat-line-round" />
            </div>
            <div class="data-info">
              <div class="data-title">客服对话数</div>
              <div class="data-number">325</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="data-overview">
            <div class="icon-wrapper purple">
              <i class="el-icon-user" />
            </div>
            <div class="data-info">
              <div class="data-title">在线用户</div>
              <div class="data-number">42</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 待审核内容 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>待审核内容</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="auditList" style="width: 100%">
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="creator" label="创建人" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template>
                <el-tag type="warning">待审核</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 知识库统计 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>知识库统计</span>
          </div>
          <div class="knowledge-stats">
            <div class="stat-item">
              <div class="stat-title">总文档数</div>
              <div class="stat-number">1,286</div>
            </div>
            <el-divider direction="vertical" />
            <div class="stat-item">
              <div class="stat-title">本月新增</div>
              <div class="stat-number">68</div>
            </div>
            <el-divider direction="vertical" />
            <div class="stat-item">
              <div class="stat-title">使用次数</div>
              <div class="stat-number">3,421</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 最近生成内容 -->
      <el-col :span="24">
        <el-card>
          <div slot="header">
            <span>最近生成内容</span>
          </div>
          <el-table :data="recentContent" style="width: 100%">
            <el-table-column prop="date" label="日期" width="180" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="creator" label="创建人" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '已发布' ? 'success' : 'info'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      auditList: [
        { type: '公告', title: '关于小区环境整治的通知', creator: '张三', status: '待审核' },
        { type: '海报', title: '端午节活动宣传海报', creator: '李四', status: '待审核' },
        { type: '纪要', title: '5月份物业工作会议纪要', creator: '王五', status: '待审核' }
      ],
      recentContent: [
        { date: '2024-03-20 10:30', type: '公告', title: '物业费缴纳通知', creator: '张三', status: '已发布' },
        { date: '2024-03-20 09:15', type: '海报', title: '春季环保活动', creator: '李四', status: '已发布' },
        { date: '2024-03-19 16:45', type: '纪要', title: '业委会会议纪要', creator: '王五', status: '审核中' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-admin {
  padding: 20px;

  .data-overview {
    display: flex;
    align-items: center;

    .icon-wrapper {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;

      i {
        font-size: 24px;
        color: #fff;
      }

      &.blue { background-color: #409EFF; }
      &.green { background-color: #67C23A; }
      &.orange { background-color: #E6A23C; }
      &.purple { background-color: #909399; }
    }

    .data-info {
      .data-title {
        font-size: 14px;
        color: #909399;
      }
      .data-number {
        font-size: 24px;
        font-weight: bold;
        margin-top: 5px;
      }
    }
  }

  .knowledge-stats {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 20px 0;

    .stat-item {
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
