import { execSync } from 'child_process'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔧 Starting Netflix CRM rebuild and serve...')

try {
  // 1. Clean and prepare dist directory
  console.log('📁 Preparing distribution directory...')
  execSync('rm -rf dist && mkdir -p dist', { cwd: __dirname })
  
  // 2. Copy and prepare the main HTML file with React
  console.log('📄 Setting up HTML entry point...')
  const indexHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CLIENT FLOW 360 - Netflix Style Real Estate CRM</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { 
        margin: 0; 
        padding: 0; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
        background: #111827; 
        color: white; 
      }
      #root { min-height: 100vh; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      // Simple inline version of the Netflix CRM for testing
      const { useState, useEffect } = React;
      
      console.log('🎬 CLIENT FLOW 360 - Starting Netflix-style CRM...');
      
      function NetflixCRM() {
        const [user, setUser] = useState(null);
        const [clients, setClients] = useState([]);
        const [error, setError] = useState('');
        const [currentView, setCurrentView] = useState('clients');
        const [isListening, setIsListening] = useState(false);
        
        const mockClients = [
          { 
            id: '1', 
            firstName: 'John', 
            lastName: 'Smith', 
            email: 'john@example.com',
            role: 'BUYER',
            stage: 'ACTIVE',
            todos: [
              { id: '1', title: 'Schedule viewing', completed: false, priority: 'HIGH', dueDate: '2024-08-30' },
              { id: '2', title: 'Prepare documents', completed: false, priority: 'MEDIUM', dueDate: '2024-09-01' }
            ]
          },
          { 
            id: '2', 
            firstName: 'Sarah', 
            lastName: 'Johnson', 
            email: 'sarah@example.com',
            role: 'SELLER',
            stage: 'NEW',
            todos: [
              { id: '3', title: 'Market analysis', completed: false, priority: 'HIGH', dueDate: '2024-08-28' }
            ]
          }
        ];
        
        const login = (email, password) => {
          if (email === 'rodrigo@realtor.com' && password === 'admin123') {
            setUser({ firstName: 'Rodrigo', lastName: 'Admin', email });
            setClients(mockClients);
            setError('');
          } else {
            setError('Invalid credentials');
          }
        };
        
        const startVoiceRecognition = () => {
          if (!('webkitSpeechRecognition' in window)) {
            alert('Voice recognition not supported in this browser');
            return;
          }
          
          const recognition = new window.webkitSpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          
          recognition.onstart = () => {
            setIsListening(true);
          };
          
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            alert('Voice command received: ' + transcript);
            setIsListening(false);
          };
          
          recognition.onerror = () => {
            setIsListening(false);
            alert('Voice recognition error');
          };
          
          recognition.onend = () => {
            setIsListening(false);
          };
          
          recognition.start();
        };
        
        const getAllTasks = () => {
          return clients.flatMap(client => 
            (client.todos || []).map(todo => ({
              ...todo,
              clientName: client.firstName + ' ' + client.lastName,
              clientId: client.id
            }))
          );
        };
        
        if (!user) {
          return React.createElement('div', {
            className: 'min-h-screen bg-gray-900 flex items-center justify-center'
          }, 
            React.createElement('div', {
              className: 'bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-red-500'
            },
              React.createElement('h1', {
                className: 'text-3xl font-bold text-red-500 text-center mb-6'
              }, '🎬 CLIENT FLOW 360'),
              React.createElement('form', {
                onSubmit: (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  login(formData.get('email'), formData.get('password'));
                }
              },
                React.createElement('input', {
                  name: 'email',
                  type: 'email',
                  placeholder: 'Email (rodrigo@realtor.com)',
                  defaultValue: 'rodrigo@realtor.com',
                  className: 'w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none'
                }),
                React.createElement('input', {
                  name: 'password',
                  type: 'password',
                  placeholder: 'Password (admin123)',
                  defaultValue: 'admin123',
                  className: 'w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none'
                }),
                error && React.createElement('div', {
                  className: 'mb-4 p-3 bg-red-600 text-white rounded-lg text-sm'
                }, error),
                React.createElement('button', {
                  type: 'submit',
                  className: 'w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold'
                }, 'Sign In')
              )
            )
          );
        }
        
        return React.createElement('div', {
          className: 'min-h-screen bg-gray-900'
        },
          // Header
          React.createElement('div', {
            className: 'bg-black border-b border-gray-800'
          },
            React.createElement('div', {
              className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
            },
              React.createElement('div', {
                className: 'flex items-center justify-between h-16'
              },
                React.createElement('div', {
                  className: 'flex items-center space-x-8'
                },
                  React.createElement('h1', {
                    className: 'text-2xl font-bold text-red-500'
                  }, '🎬 CLIENT FLOW 360'),
                  React.createElement('nav', {
                    className: 'flex space-x-8'
                  },
                    React.createElement('button', {
                      onClick: () => setCurrentView('clients'),
                      className: 'transition-colors ' + (currentView === 'clients' ? 'text-white' : 'text-gray-400 hover:text-red-400')
                    }, 'Clients'),
                    React.createElement('button', {
                      onClick: () => setCurrentView('tasks'),
                      className: 'transition-colors ' + (currentView === 'tasks' ? 'text-white' : 'text-gray-400 hover:text-red-400')
                    }, 'All Tasks')
                  )
                ),
                React.createElement('div', {
                  className: 'flex items-center space-x-4'
                },
                  React.createElement('span', {
                    className: 'text-gray-300'
                  }, 'Welcome, ' + user.firstName + '!'),
                  React.createElement('button', {
                    onClick: () => setUser(null),
                    className: 'bg-gray-800 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all duration-200'
                  }, 'Logout')
                )
              )
            )
          ),
          
          // Main Content
          React.createElement('div', {
            className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
          },
            currentView === 'clients' ? (
              React.createElement('div', {},
                React.createElement('div', {
                  className: 'flex items-center justify-between mb-8'
                },
                  React.createElement('h2', {
                    className: 'text-3xl font-bold text-white'
                  }, 'Your Clients'),
                  React.createElement('div', {
                    className: 'flex space-x-4'
                  },
                    React.createElement('button', {
                      onClick: startVoiceRecognition,
                      disabled: isListening,
                      className: 'px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg ' + 
                        (isListening ? 'bg-green-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700') + ' text-white'
                    },
                      React.createElement('span', {}, isListening ? '🔴' : '🎤'),
                      React.createElement('span', {}, isListening ? 'Listening...' : 'Voice Task')
                    )
                  )
                ),
                React.createElement('div', {
                  className: 'grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-3'
                },
                  clients.map(client =>
                    React.createElement('div', {
                      key: client.id,
                      className: 'group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-red-500'
                    },
                      React.createElement('div', {
                        className: 'aspect-square bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center relative overflow-hidden'
                      },
                        React.createElement('div', {
                          className: 'text-lg font-bold text-white'
                        }, client.firstName.charAt(0) + client.lastName.charAt(0)),
                        React.createElement('div', {
                          className: 'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center'
                        },
                          React.createElement('div', {
                            className: 'opacity-0 group-hover:opacity-100 transition-all duration-300 text-white text-xs font-semibold'
                          }, 'View')
                        )
                      ),
                      React.createElement('div', {
                        className: 'p-2'
                      },
                        React.createElement('div', {
                          className: 'text-white text-xs font-medium leading-tight'
                        }, client.firstName + ' ' + client.lastName),
                        React.createElement('div', {
                          className: 'text-gray-400 text-xs leading-tight'
                        }, client.role),
                        React.createElement('div', {
                          className: 'text-xs text-gray-500 leading-tight'
                        }, (client.todos?.length || 0) + ' tasks')
                      )
                    )
                  )
                )
              )
            ) : (
              React.createElement('div', {},
                React.createElement('h2', {
                  className: 'text-3xl font-bold text-white mb-8'
                }, 'All Tasks Dashboard'),
                React.createElement('div', {
                  className: 'space-y-4'
                },
                  getAllTasks().map(task =>
                    React.createElement('div', {
                      key: task.id,
                      className: 'bg-gray-800 rounded-lg p-4 border border-gray-700'
                    },
                      React.createElement('div', {
                        className: 'flex items-center justify-between'
                      },
                        React.createElement('div', {},
                          React.createElement('h3', {
                            className: 'text-white font-medium'
                          }, task.title),
                          React.createElement('p', {
                            className: 'text-gray-400 text-sm'
                          }, 'Client: ' + task.clientName)
                        ),
                        React.createElement('div', {
                          className: 'flex items-center space-x-2'
                        },
                          React.createElement('span', {
                            className: 'px-2 py-1 rounded text-xs font-medium ' + 
                              (task.priority === 'HIGH' ? 'bg-red-600 text-white' : 
                               task.priority === 'MEDIUM' ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-white')
                          }, task.priority),
                          task.dueDate && React.createElement('span', {
                            className: 'text-gray-400 text-xs'
                          }, new Date(task.dueDate).toLocaleDateString())
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        );
      }
      
      // Render the app
      ReactDOM.render(React.createElement(NetflixCRM), document.getElementById('root'));
    </script>
  </body>
</html>`;
  
  writeFileSync(join(__dirname, 'dist', 'index.html'), indexHTML);
  
  console.log('✅ Netflix CRM rebuild completed!');
  
  // 3. Start Express server
  const app = express();
  const PORT = 8084;
  
  app.use(express.static(join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Netflix-style CRM running on http://0.0.0.0:${PORT}`);
    console.log(`🎬 CLIENT FLOW 360 is ready!`);
  });
  
} catch (error) {
  console.error('❌ Build error:', error.message);
  process.exit(1);
}