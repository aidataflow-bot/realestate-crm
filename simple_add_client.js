      // Simple Add Client Modal Component
      function AddClientModal({ onClose, onAdd }) {
        const [formData, setFormData] = useState({
          // Basic Information
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          
          // Mailing Address
          address: '',
          city: '',
          state: '',
          zipCode: '',
          
          // Personal Details  
          birthday: '',
          anniversary: '', // Please clarify: What should this second date be?
          spouse: '',
          children: '',
          
          // Property of Interest
          propertyAddress: '',
          propertyPrice: '',
          propertyType: 'house',
          budget: '',
          
          // CRM Details
          stage: 'LEAD',
          source: 'referral',
          notes: '',
          tags: ''
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
            propertyPrice: parseInt(formData.propertyPrice) || null,
            lifetimeNetCommission: 0,
            calls: [],
            propertiesOfInterest: formData.propertyAddress ? [{
              address: formData.propertyAddress,
              price: formData.propertyPrice,
              type: formData.propertyType,
              notes: `Initial property of interest`
            }] : [],
            todos: [],
            transactions: []
          };
          onAdd(newClient);
        };

        const handleChange = (field, value) => {
          setFormData(prev => ({ ...prev, [field]: value }));
        };

        return React.createElement('div', { 
          className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          onClick: onClose
        },
          React.createElement('div', { 
            className: 'bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto',
            onClick: (e) => e.stopPropagation()
          },
            React.createElement('h2', { className: 'text-xl font-bold mb-6 text-white flex items-center' },
              React.createElement('span', { className: 'mr-3' }, '👤'),
              'Add New Client'
            ),
            
            React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
              
              // Basic Information Section
              React.createElement('div', { className: 'mb-6' },
                React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2' }, 'Contact Information'),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-4' },
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'First Name *',
                    value: formData.firstName,
                    onChange: (e) => handleChange('firstName', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400',
                    required: true
                  }),
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'Last Name *',
                    value: formData.lastName,
                    onChange: (e) => handleChange('lastName', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400',
                    required: true
                  })
                ),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                  React.createElement('input', {
                    type: 'email',
                    placeholder: 'Email *',
                    value: formData.email,
                    onChange: (e) => handleChange('email', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400',
                    required: true
                  }),
                  React.createElement('input', {
                    type: 'tel',
                    placeholder: 'Phone Number *',
                    value: formData.phone,
                    onChange: (e) => handleChange('phone', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400',
                    required: true
                  })
                )
              ),

              // Mailing Address Section
              React.createElement('div', { className: 'mb-6' },
                React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2' }, 'Mailing Address'),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'Street Address',
                  value: formData.address,
                  onChange: (e) => handleChange('address', e.target.value),
                  className: 'w-full p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400 mb-3'
                }),
                React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'City',
                    value: formData.city,
                    onChange: (e) => handleChange('city', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400'
                  }),
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'State',
                    value: formData.state,
                    onChange: (e) => handleChange('state', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400'
                  }),
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'ZIP Code',
                    value: formData.zipCode,
                    onChange: (e) => handleChange('zipCode', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400'
                  })
                )
              ),

              // Property of Interest Section
              React.createElement('div', { className: 'mb-6' },
                React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2' }, 'Property of Interest'),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'Property Address',
                  value: formData.propertyAddress,
                  onChange: (e) => handleChange('propertyAddress', e.target.value),
                  className: 'w-full p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400 mb-3'
                }),
                React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
                  React.createElement('input', {
                    type: 'number',
                    placeholder: 'Property Price ($)',
                    value: formData.propertyPrice,
                    onChange: (e) => handleChange('propertyPrice', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400'
                  }),
                  React.createElement('select', {
                    value: formData.propertyType,
                    onChange: (e) => handleChange('propertyType', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white'
                  },
                    React.createElement('option', { value: 'house' }, 'House'),
                    React.createElement('option', { value: 'condo' }, 'Condo'),
                    React.createElement('option', { value: 'apartment' }, 'Apartment'),
                    React.createElement('option', { value: 'townhouse' }, 'Townhouse'),
                    React.createElement('option', { value: 'commercial' }, 'Commercial')
                  ),
                  React.createElement('input', {
                    type: 'number',
                    placeholder: 'Budget ($)',
                    value: formData.budget,
                    onChange: (e) => handleChange('budget', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400'
                  })
                )
              ),

              // Personal Information Section
              React.createElement('div', { className: 'mb-6' },
                React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2' }, 'Personal Information'),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-3' },
                  React.createElement('div', {},
                    React.createElement('label', { className: 'block text-sm text-gray-400 mb-1' }, 'Birthday'),
                    React.createElement('input', {
                      type: 'date',
                      value: formData.birthday,
                      onChange: (e) => handleChange('birthday', e.target.value),
                      className: 'w-full p-3 bg-gray-700 rounded border border-gray-600 text-white'
                    })
                  ),
                  React.createElement('div', {},
                    React.createElement('label', { className: 'block text-sm text-gray-400 mb-1' }, 'Anniversary (What is this for?)'),
                    React.createElement('input', {
                      type: 'date',
                      value: formData.anniversary,
                      onChange: (e) => handleChange('anniversary', e.target.value),
                      className: 'w-full p-3 bg-gray-700 rounded border border-gray-600 text-white'
                    })
                  )
                ),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'Spouse/Partner Name',
                    value: formData.spouse,
                    onChange: (e) => handleChange('spouse', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400'
                  }),
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'Children (e.g., Emma 12, Jake 8)',
                    value: formData.children,
                    onChange: (e) => handleChange('children', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400'
                  })
                )
              ),

              // CRM Details Section
              React.createElement('div', { className: 'mb-6' },
                React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2' }, 'CRM Details'),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-3' },
                  React.createElement('select', {
                    value: formData.stage,
                    onChange: (e) => handleChange('stage', e.target.value),
                    className: 'p-3 bg-gray-700 rounded border border-gray-600 text-white'
                  },
                    React.createElement('option', { value: 'LEAD' }, 'Lead'),
                    React.createElement('option', { value: 'QUALIFIED' }, 'Qualified'),
                    React.createElement('option', { value: 'ACTIVE' }, 'Active'),
                    React.createElement('option', { value: 'UNDER_CONTRACT' }, 'Under Contract'),
                    React.createElement('option', { value: 'CLOSED' }, 'Closed')
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
                    React.createElement('option', { value: 'advertisement' }, 'Advertisement')
                  )
                ),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'Tags (comma-separated)',
                  value: formData.tags,
                  onChange: (e) => handleChange('tags', e.target.value),
                  className: 'w-full p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400 mb-3'
                }),
                React.createElement('textarea', {
                  placeholder: 'Notes...',
                  value: formData.notes,
                  onChange: (e) => handleChange('notes', e.target.value),
                  rows: 3,
                  className: 'w-full p-3 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400'
                })
              ),

              // Form Actions
              React.createElement('div', { className: 'flex space-x-3 pt-4 border-t border-gray-600' },
                React.createElement('button', {
                  type: 'button',
                  onClick: onClose,
                  className: 'flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors'
                }, 'Cancel'),
                React.createElement('button', {
                  type: 'submit',
                  className: 'flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold'
                }, 'Add Client')
              )
            )
          )
        );
      }