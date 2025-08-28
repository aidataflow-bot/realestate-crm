      // Comprehensive Add Client Modal Component with Tabs
      function AddClientModal({ onClose, onAdd }) {
        const [activeTab, setActiveTab] = useState('overview');
        const [formData, setFormData] = useState({
          // Basic Information
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          alternatePhone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          
          // Personal Details
          birthday: '',
          anniversary: '',
          spouse: '',
          children: '',
          occupation: '',
          employer: '',
          
          // Real Estate Preferences
          budget: '',
          budgetMax: '',
          propertyType: 'house',
          bedrooms: '',
          bathrooms: '',
          sqftMin: '',
          sqftMax: '',
          preferredAreas: '',
          mustHaves: '',
          dealBreakers: '',
          
          // CRM Details
          stage: 'LEAD',
          source: 'referral',
          priority: 'medium',
          assignedAgent: '',
          notes: '',
          tags: '',
          
          // Communication Preferences
          preferredContact: 'email',
          bestTimeToCall: 'morning',
          communicationFrequency: 'weekly',
          
          // Financial Information
          preApproved: false,
          lenderInfo: '',
          downPayment: '',
          creditScore: '',
          
          // Timeline
          timeframe: '0-3 months',
          currentSituation: 'looking',
          moveInDate: '',
          
          // Initial Property of Interest
          initialProperty: {
            address: '',
            price: '',
            notes: ''
          }
        });

        const handleSubmit = (e) => {
          e.preventDefault();
          const newClient = {
            ...formData,
            id: 'client-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            createdAt: new Date().toISOString(),
            isDemo: false,
            budget: parseInt(formData.budget) || null,
            budgetMax: parseInt(formData.budgetMax) || null,
            lifetimeNetCommission: 0,
            calls: [],
            propertiesOfInterest: formData.initialProperty.address ? [formData.initialProperty] : [],
            todos: [],
            transactions: []
          };
          onAdd(newClient);
        };

        const handleChange = (field, value) => {
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
              ...prev,
              [parent]: {
                ...prev[parent],
                [child]: value
              }
            }));
          } else {
            setFormData(prev => ({ ...prev, [field]: value }));
          }
        };

        const tabs = [
          { id: 'overview', label: '👤 Overview', icon: '👤' },
          { id: 'personal', label: '🏠 Personal', icon: '🏠' },
          { id: 'preferences', label: '🎯 Property Preferences', icon: '🎯' },
          { id: 'financial', label: '💰 Financial', icon: '💰' },
          { id: 'communication', label: '📞 Communication', icon: '📞' }
        ];

        const renderTabContent = () => {
          switch (activeTab) {
            case 'overview':
              return React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'First Name *',
                    value: formData.firstName,
                    onChange: (e) => handleChange('firstName', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white',
                    required: true
                  }),
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'Last Name *',
                    value: formData.lastName,
                    onChange: (e) => handleChange('lastName', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white',
                    required: true
                  })
                ),
                React.createElement('input', {
                  type: 'email',
                  placeholder: 'Email *',
                  value: formData.email,
                  onChange: (e) => handleChange('email', e.target.value),
                  className: 'w-full p-3 bg-gray-700 rounded border border-gray-600 text-white',
                  required: true
                }),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                  React.createElement('input', {
                    type: 'tel',
                    placeholder: 'Primary Phone *',
                    value: formData.phone,
                    onChange: (e) => handleChange('phone', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white',
                    required: true
                  }),
                  React.createElement('input', {
                    type: 'tel',
                    placeholder: 'Alternate Phone',
                    value: formData.alternatePhone,
                    onChange: (e) => handleChange('alternatePhone', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white'
                  })
                ),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'Address',
                  value: formData.address,
                  onChange: (e) => handleChange('address', e.target.value),
                  className: 'w-full p-3 bg-gray-700 rounded border border-gray-600 text-white'
                }),
                React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'City',
                    value: formData.city,
                    onChange: (e) => handleChange('city', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white'
                  }),
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'State',
                    value: formData.state,
                    onChange: (e) => handleChange('state', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white'
                  }),
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'ZIP Code',
                    value: formData.zipCode,
                    onChange: (e) => handleChange('zipCode', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white'
                  })
                ),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                  React.createElement('select', {
                    value: formData.stage,
                    onChange: (e) => handleChange('stage', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white'
                  },
                    React.createElement('option', { value: 'LEAD' }, 'Lead'),
                    React.createElement('option', { value: 'QUALIFIED' }, 'Qualified Lead'),
                    React.createElement('option', { value: 'ACTIVE' }, 'Active Buyer'),
                    React.createElement('option', { value: 'UNDER_CONTRACT' }, 'Under Contract'),
                    React.createElement('option', { value: 'CLOSED' }, 'Closed Deal'),
                    React.createElement('option', { value: 'INACTIVE' }, 'Inactive')
                  ),
                  React.createElement('select', {
                    value: formData.source,
                    onChange: (e) => handleChange('source', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white'
                  },
                    React.createElement('option', { value: 'referral' }, 'Referral'),
                    React.createElement('option', { value: 'website' }, 'Website'),
                    React.createElement('option', { value: 'social' }, 'Social Media'),
                    React.createElement('option', { value: 'cold_call' }, 'Cold Call'),
                    React.createElement('option', { value: 'open_house' }, 'Open House'),
                    React.createElement('option', { value: 'advertisement' }, 'Advertisement'),
                    React.createElement('option', { value: 'walk_in' }, 'Walk-in'),
                    React.createElement('option', { value: 'other' }, 'Other')
                  )
                )
              );

            case 'personal':
              // Personal tab content here...
              return React.createElement('div', { className: 'space-y-4 text-center py-8' },
                React.createElement('p', { className: 'text-gray-400' }, 'Personal information tab content')
              );

            default:
              return React.createElement('div', { className: 'text-center py-8' },
                React.createElement('p', { className: 'text-gray-400' }, 'Tab content coming soon')
              );
          }
        };

        return React.createElement('div', { 
          className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          onClick: onClose
        },
          React.createElement('div', { 
            className: 'bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden',
            onClick: (e) => e.stopPropagation()
          },
            // Header
            React.createElement('div', { className: 'bg-gradient-to-r from-blue-600 to-blue-700 p-6' },
              React.createElement('div', { className: 'flex items-center justify-between' },
                React.createElement('h2', { className: 'text-2xl font-bold text-white flex items-center' },
                  React.createElement('span', { className: 'mr-3 text-3xl' }, '👤'),
                  'Add New Client'
                ),
                React.createElement('button', {
                  onClick: onClose,
                  className: 'text-white hover:text-gray-300 transition-colors text-2xl'
                }, '×')
              )
            ),

            // Tab Navigation
            React.createElement('div', { className: 'bg-gray-700 px-6 py-3' },
              React.createElement('div', { className: 'flex space-x-1 overflow-x-auto' },
                tabs.map(tab => 
                  React.createElement('button', {
                    key: tab.id,
                    onClick: () => setActiveTab(tab.id),
                    className: `px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`
                  }, 
                    React.createElement('span', { className: 'mr-2' }, tab.icon),
                    tab.label.split(' ').slice(1).join(' ')
                  )
                )
              )
            ),

            // Form Content
            React.createElement('form', { onSubmit: handleSubmit, className: 'flex flex-col h-full' },
              React.createElement('div', { className: 'flex-1 p-6 overflow-y-auto' },
                renderTabContent()
              ),

              // Form Actions
              React.createElement('div', { className: 'bg-gray-700 px-6 py-4 flex justify-end space-x-3' },
                React.createElement('button', {
                  type: 'button',
                  onClick: onClose,
                  className: 'px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors'
                }, 'Cancel'),
                React.createElement('button', {
                  type: 'submit',
                  className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center'
                }, 
                  React.createElement('span', { className: 'mr-2' }, '✅'),
                  'Add Client'
                )
              )
            )
          )
        );
      }