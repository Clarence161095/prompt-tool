import { createContext, useContext, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'

const DATA = {
  'Đọc báo': [
    {
      name: 'Đọc Báo English',
      prompt: 'Đọc Báo English',
      feature: 'repeat_xxxxx1_with_clipboard',
      isEditMode: true,
    },
    {
      name: 'Đọc Báo Japanese',
      prompt: 'Đọc Báo Japanese',
      feature: 'repeat_xxxxx1_with_clipboard',
      isEditMode: false,
    },
  ],
  'Viết bài': [
    {
      name: 'Đọc Báo English',
      prompt: 'Đọc Báo English',
      feature: 'repeat_xxxxx1_with_clipboard',
      isEditMode: true,
    },
    {
      name: 'Đọc Báo Japanese',
      prompt: 'Đọc Báo Japanese',
      feature: 'repeat_xxxxx1_with_clipboard',
      isEditMode: false,
    },
  ],
}

const DEFAULT_FEATURES = [
  {
    id: 'repeat_xxxxx1_with_clipboard',
    label: 'Repeat XXXXX1 with clipboard',
    function: prompt => {
      navigator.clipboard.readText().then(value => {
        const newValue = prompt.replace('XXXXX1', value)
        navigator.clipboard.writeText(newValue)
        toast.success('Done and Copied to clipboard')
      })
    },
  },
]

const context = createContext()

const setThrottleLocalStorage = (name, value) => {
  const lastTime = localStorage.getItem('lastTime')
  if (!lastTime || Date.now() - lastTime > 500) {
    localStorage.setItem('lastTime', Date.now())
    localStorage.setItem(name, JSON.stringify(value))
  }
}

function get(name, defaultValue) {
  return JSON.parse(localStorage.getItem(name)) || defaultValue
}

function set(name, value) {
  localStorage.setItem(name, JSON.stringify(value))
}

function Content() {
  const { data, activeMenu, setActiveMenu, setData } = useContext(context)
  const newPromptRef = useRef()
  const newFeatureRef = useRef()

  return (
    <div className="w-3/4">
      <div className="px-4 border-b-2 border-[#ecf0f1] flex justify-between">
        <h1 className="text-xl mt-2 font-bold  pb-2 justify-center flex">
          {activeMenu}
        </h1>
        <button
          className="text-xs bg-[#e74c3c] px-2 py-1 rounded-md m-2"
          onClick={() => {
            if (window.confirm('Are you sure to delete this menu?')) {
              const newData = { ...data }
              delete newData[activeMenu]
              set('data', newData)
              setActiveMenu(Object.keys(newData)[0])
              window.location.reload()
            }
          }}
        >
          Delete
        </button>
      </div>
      <div className="p-2">
        <div className="mt-2">
          {data[activeMenu] &&
            data[activeMenu].map((prompt, index) => (
              <div
                key={index}
                className="flex flex-col justify-between border-b-2 border-[#ecf0f1] py-2 hover:bg-[#2c3e50] cursor-pointer px-2 hover:border-[#f39c12] transition-all duration-200 ease-in-out"
              >
                <div className="flex justify-between">
                  <span className="ml-2">{prompt.name}</span>
                  <div className="flex gap-1 mr-2 mt-1 w-1/3 justify-end">
                    <button
                      className="text-xs bg-[#2980b9] px-2 py-1 rounded-md w-1/2"
                      onClick={() => {
                        setData({
                          ...data,
                          [activeMenu]: data[activeMenu].map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  isEditMode: !item.isEditMode,
                                }
                              : item,
                          ),
                        })
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs bg-[#e74c3c] px-2 py-1 rounded-md w-1/2"
                      onClick={() => {
                        if (
                          window.confirm('Are you sure to delete this prompt?')
                        ) {
                          setData({
                            ...data,
                            [activeMenu]: data[activeMenu].filter(
                              (item, i) => i !== index,
                            ),
                          })
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {prompt.isEditMode && (
                  <div className="flex flex-col mt-1">
                    <select className="px-2 py-1 rounded-md border-2 border-[#ecf0f1] text-black mt-1">
                      {DEFAULT_FEATURES.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      className="px-2 py-1 rounded-md border-2 border-[#ecf0f1] text-black mt-2"
                      placeholder="Prompt"
                      value={prompt.prompt || ''}
                      onChange={e => {
                        setData({
                          ...data,
                          [activeMenu]: data[activeMenu].map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  prompt: e.target.value,
                                }
                              : item,
                          ),
                        })
                      }}
                    />
                  </div>
                )}
                <button
                  className="text-xs bg-[#2ecc71] px-2 py-1 rounded-md mt-2"
                  onClick={() => {
                    const thisPrompt = data[activeMenu][index]
                    const feature = DEFAULT_FEATURES.find(
                      item => item.id === thisPrompt.feature,
                    )
                    feature.function(thisPrompt.prompt)
                  }}
                >
                  Run
                </button>
              </div>
            ))}
          {/* add prompt*/}
          <div className="flex justify-between border-b-2 border-[#ecf0f1] py-2 gap-1">
            <input
              type="text"
              className="px-2 py-1 w-1/2 rounded-md border-2 border-[#ecf0f1] text-black"
              placeholder="Prompt"
              ref={newPromptRef}
            />
            <select
              className="px-2 py-1 rounded-md border-2 border-[#ecf0f1] text-black w-1/3"
              ref={newFeatureRef}
            >
              {DEFAULT_FEATURES.map((item, index) => (
                <option key={index} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              className="text-xs bg-[#2ecc71] px-2 py-1 rounded-md w-1/6"
              onClick={() => {
                const newFeatureId = newFeatureRef.current.value
                const newPromptName = newPromptRef.current.value
                const newPromptValue =
                  newPromptName +
                    DEFAULT_FEATURES.find(item => item.id === newFeatureId)
                      .label || ''
                if (newPromptName) {
                  setData({
                    ...data,
                    [activeMenu]: [
                      ...data[activeMenu],
                      {
                        name: newPromptName,
                        prompt: newPromptValue,
                        feature: newFeatureId,
                        isEditMode: true,
                      },
                    ],
                  })
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Menu() {
  const { data, menuList, activeMenu, setActiveMenu } = useContext(context)
  const newMenuRef = useRef()

  const activeClassNames =
    'text-[#f39c12] border-l-4 border-[#f39c12] bg-[#2c3e50] border-b-2 border-[#ecf0f1] pb-2 flex'

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(data))
    toast.success('Exported')
  }

  const handleImport = () => {
    const input = prompt('Paste your data here')
    if (input) {
      try {
        const data = JSON.parse(input)
        setThrottleLocalStorage('data', data)
        toast.success('Imported')
        window.location.reload()
      } catch (error) {
        toast.error('Invalid data')
      }
    }
  }

  return (
    <div className="w-1/4 bg-[#34495e] min-h-[500px]">
      <div className="p-2">
        <h1 className="text-xl font-bold border-b-2 border-[#ecf0f1] pb-2 justify-center flex">
          Menu
        </h1>
        {/* button Export and Import */}
        <div className="flex justify-between mt-2 border-[#ecf0f1] pb-2 border-b-2">
          <button
            className="text-xs bg-[#2980b9] px-2 py-1 rounded-md w-5/12"
            onClick={handleExport}
          >
            Export
          </button>
          <button
            className="text-xs bg-[#2ecc71] px-2 py-1 rounded-md w-5/12"
            onClick={handleImport}
          >
            Import
          </button>
        </div>
        <ul className="mt-2">
          {menuList &&
            menuList.map(item => (
              <li
                key={item}
                onClick={() => setActiveMenu(item)}
                className={`cursor-pointer py-2 px-4 hover:bg-[#2c3e50]
                flex justify-between
                ${item === activeMenu ? activeClassNames : ''}`}
              >
                <span>{item}</span>
              </li>
            ))}
        </ul>
        {/* Add Menu */}
        <div className="flex justify-between mt-2 border-[#ecf0f1] pb-2 border-b-2 gap-1">
          <input
            type="text"
            className="px-2 py-1 w-2/3 rounded-md border-2 border-[#ecf0f1] text-black"
            placeholder="Menu"
            ref={newMenuRef}
          />
          <button
            className="text-xs bg-[#2ecc71] px-2 py-1 rounded-md w-1/3"
            onClick={() => {
              const newMenu = newMenuRef.current.value
              if (newMenu) {
                setThrottleLocalStorage('data', {
                  ...data,
                  [newMenu]: [],
                })
                window.location.reload()
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [data, _setData] = useState(get('data', DATA))
  const [activeMenu, _activeMenu] = useState(
    get('activeMenu', data[0] || DATA[0]),
  )
  const menuList = Object.keys(data)

  function setData(data) {
    setThrottleLocalStorage('data', data)
    _setData(data)
  }

  function setActiveMenu(value) {
    set('activeMenu', value)
    _activeMenu(value)
  }

  return (
    <context.Provider
      value={{
        data,
        setData,
        menuList,
        activeMenu,
        setActiveMenu,
      }}
    >
      <div className="min-w-[500px] min-h-[500px] bg-[#2c3e50] text-[#ecf0f1]">
        <div className="flex h-full">
          <Menu />
          <Content />
        </div>
      </div>
      <Toaster />
    </context.Provider>
  )
}

export default App
