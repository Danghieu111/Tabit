function Tabit(selector, option = {}) {
    this.option = {
        firstActiveElement: 0,
        rememberState: false,
        onChange: null,
        classActive : 'tabit--active',
        ...option
    }

    this.firstActive = this.option.firstActiveElement 
    this.container = document.querySelector(selector)
    this._cleanRegex = /[^a-zA-Z0-9]/g
    this.selector = selector.replace(this._cleanRegex, "")
    if (!this.container) {
        console.error(`Tabit: Not found container for selector ${selector}`)
        return
    }

    this.tabs = Array.from(this.container.querySelectorAll('li a'))
    if(!this.tabs.length) {
        console.error('Tablit: Not found tab in container')
        return
    }

    this.panels = this._getPanels()

    if (this.tabs.length !== this.panels.length) return
    this._originalHTML = this.container.innerHTML
    this.init()
}

Tabit.prototype._getPanels = function() {
    return this.tabs.map(tab => {
        const panel = document.querySelector(tab.getAttribute('href'))

        if (!panel) {
            console.error(`Tabit: Not found panel for tab ${tab.getAttribute('href')}`)
        }
        return panel
    }).filter(Boolean)
}

Tabit.prototype.init = function() {
    this.params = new URLSearchParams(location.search)
    const tabSelector = this.params.get(this.selector)
    const tabActiveLocal = (this.option.rememberState && location.search && this.tabs.find(tab => tab.getAttribute('href').replace(this._cleanRegex, "") === tabSelector)) || this.tabs[this.firstActive]

    this.activeTab(tabActiveLocal, false)

    this.tabs.forEach(tab => {
        tab.onclick = (e) => {
            this.handleTabClick(tab, e)
        }
    })

    this.currentTab = tabActiveLocal
}

Tabit.prototype._tryActiveTab = function(tab) {
    if (this.currentTab != tab) {
        this.activeTab(tab)
        this.currentTab = tab
    }
}

Tabit.prototype.handleTabClick = function(tab, e) {
    e.preventDefault()
    this._tryActiveTab(tab)
}

Tabit.prototype.activeTab = function(tab, triggerOnChange = true) {
    this.tabs.forEach(tab => {
        tab.closest('li').classList.remove(this.option.classActive)
    })
    tab.closest('li').classList.add(this.option.classActive)

    this.panels.forEach(panel => {
        panel.hidden = true
    })

    document.querySelector(tab.getAttribute('href')).hidden = false

    if (this.option.rememberState) {
        const params = new URLSearchParams(location.search)
        params.set(this.selector, tab.getAttribute('href').replace(this._cleanRegex, ''))
        history.replaceState(null, null, `?${params}`)
    }


    if( typeof this.option.onChange === 'function' && triggerOnChange) {
        const panel = document.querySelector(tab.getAttribute('href'))
        const dataTab = {
            tab,
            panel
        }

        this.option.onChange(dataTab)
    }

}

Tabit.prototype.switch = function(input) {
    const activeTab = 
        typeof input === 'string' ? 
            this.tabs.find(tab => tab.getAttribute('href') === input) 
            : this.tabs.includes(input) 
            ? input 
            : null

    this._tryActiveTab(activeTab)
}

Tabit.prototype.destroy = function() {
    this.container.innerHTML = this._originalHTML
    this.panels.forEach(panel => {
        panel.hidden = false
    })

    this.container = null
    this.tabs = null
    this.panels = null
    this.currentTab = null
}