import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { immutableRenderDecorator } from 'react-immutable-render-mixin'
import { propTypes } from '~decorators'
import api from '~api'
import { setMessage } from '~utils'
import { getCategoryList } from '~reducers/global/category'
import AInput from '~components/_input.jsx'

function mapStateToProps(state) {
    return {
        category: state.category.toJS().lists
    }
}
function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators({ getCategoryList }, dispatch)
    return { ...actions, dispatch }
}

@connect(mapStateToProps, mapDispatchToProps)
@immutableRenderDecorator
@propTypes({

})
export default class ArticleInsert extends Component {
    constructor(props) {
        super(props)
        this.state = {
            title: '',
            category: '',
            content: ''
        }
        this.handleInsert = this.handleInsert.bind(this)
    }
    componentDidMount() {
        this.props.getCategoryList()
        // eslint-disable-next-line
        window.postEditor = editormd("post-content", {
            width: "100%",
            height: 500,
            markdown: "",
            placeholder: '请输入内容...',
            path: '/static/editor.md/lib/',
            toolbarIcons() {
                return [
                    "bold", "italic", "quote", "|",
                    "list-ul", "list-ol", "hr", "|",
                    "link", "reference-link", "image", "code", "table", "|",
                    "watch", "preview", "fullscreen"
                ]
            },
            watch: false,
            saveHTMLToTextarea: true
        })
    }
    handleInsert() {
        // eslint-disable-next-line
        const content = postEditor.getMarkdown()
        if (!this.state.title || !this.state.category || !content) {
            setMessage('请将表单填写完整!')
            return
        }
        this.setState({ content }, async () => {
            const { data: { message, code, data } } = await api.post('backend/article/insert', this.state)
            if (code === 200) {
                setMessage({ type: 'success', content: message })
                this.props.dispatch({ type: 'insertArticleItem', item: data })
                this.props.router.push('/backend/article/list')
            }
        })
    }
    render() {
        const select = this.props.category.map(item => {
            return <option key={item._id} value={item._id + '|' + item.cate_name}>{item.cate_name}</option>
        })
        return (
            <div className="settings-main card">
                <div className="settings-main-content">
                    <AInput title="标题">
                        <input value={this.state.title} onChange={e => this.setState({ title: e.target.value })} type="text" placeholder="标题" className="base-input" name="title" />
                        <span className="input-info error">请输入标题</span>
                    </AInput>
                    <AInput title="分类" classes={'select-item-wrap'}>
                        <i className="icon icon-arrow-down" />
                        <select value={this.state.category} onChange={e => this.setState({ category: e.target.value })} className="select-item" name="category">
                            <option value="">请选择分类</option>
                            {select}
                        </select>
                        <span className="input-info error">请输入分类</span>
                    </AInput>
                    <div className="settings-section">
                        <div id="post-content" className="settings-item-content">
                            <textarea id="editor" name="content" className="form-control hidden" data-autosave="editor-content" />
                        </div>
                    </div>
                </div>
                <div className="settings-footer clearfix">
                    <a onClick={this.handleInsert} href="javascript:;" className="btn btn-yellow">添加文章</a>
                </div>
            </div>
        )
    }
}
