import*as Common from"../common/common.js";import*as DataGrid from"../data_grid/data_grid.js";import*as UI from"../ui/ui.js";export class DatabaseTableView extends UI.View.SimpleView{constructor(t,e){super(Common.UIString.UIString("Database")),this.database=t,this.tableName=e,this.element.classList.add("storage-view","table"),this._visibleColumnsSetting=Common.Settings.Settings.instance().createSetting("databaseTableViewVisibleColumns",{}),this.refreshButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString("Refresh"),"largeicon-refresh"),this.refreshButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._refreshButtonClicked,this),this._visibleColumnsInput=new UI.Toolbar.ToolbarInput(Common.UIString.UIString("Visible columns"),"",1),this._visibleColumnsInput.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged,this._onVisibleColumnsChanged,this),this._dataGrid}wasShown(){this.update()}async toolbarItems(){return[this.refreshButton,this._visibleColumnsInput]}_escapeTableName(t){return t.replace(/\"/g,'""')}update(){this.database.executeSql('SELECT rowid, * FROM "'+this._escapeTableName(this.tableName)+'"',this._queryFinished.bind(this),this._queryError.bind(this))}_queryFinished(t,e){if(this.detachChildWidgets(),this.element.removeChildren(),this._dataGrid=DataGrid.SortableDataGrid.SortableDataGrid.create(t,e,ls`Database`),this._visibleColumnsInput.setVisible(!!this._dataGrid),!this._dataGrid)return this._emptyWidget=new UI.EmptyWidget.EmptyWidget(ls`The "${this.tableName}"\ntable is empty.`),void this._emptyWidget.show(this.element);this._dataGrid.setStriped(!0),this._dataGrid.asWidget().show(this.element),this._dataGrid.autoSizeColumns(5),this._columnsMap=new Map;for(let e=1;e<t.length;++e)this._columnsMap.set(t[e],String(e));this._lastVisibleColumns="";const i=this._visibleColumnsSetting.get()[this.tableName]||"";this._visibleColumnsInput.setValue(i),this._onVisibleColumnsChanged()}_onVisibleColumnsChanged(){if(!this._dataGrid)return;const t=this._visibleColumnsInput.value(),e=t.split(/[\s,]+/),i=new Set,s={0:!0};for(let t=0;t<e.length;++t){const a=e[t];this._columnsMap.has(a)&&(i.add(a),s[this._columnsMap.get(a)]=!0)}const a=[...i].sort().join(", ");if(0===a.length)for(const t of this._columnsMap.values())s[t]=!0;if(a===this._lastVisibleColumns)return;const n=this._visibleColumnsSetting.get();n[this.tableName]=t,this._visibleColumnsSetting.set(n),this._dataGrid.setColumnsVisiblity(s),this._lastVisibleColumns=a}_queryError(t){this.detachChildWidgets(),this.element.removeChildren();const e=createElement("div");e.className="storage-table-error",e.textContent=ls`An error occurred trying to\nread the "${this.tableName}" table.`,this.element.appendChild(e)}_refreshButtonClicked(t){this.update()}}