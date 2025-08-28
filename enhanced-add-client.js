// Enhanced Add Client Modal Component with organized sections
function EnhancedAddClientModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'United States',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    birthday: '',
    spouse: '',
    children: '',
    notes: '',
    tags: '',
    propertyStreetAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyZipCode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create property interest object if any property fields are filled
    const hasPropertyData = formData.propertyStreetAddress || formData.propertyCity || formData.propertyState || formData.propertyZipCode;
    const propertyInterest = hasPropertyData ? [{
      id: `property-${Date.now()}`,
      address: `${formData.propertyStreetAddress || ''} ${formData.propertyCity || ''}, ${formData.propertyState || ''} ${formData.propertyZipCode || ''}`.trim().replace(/,\s*$/, ''),
      streetAddress: formData.propertyStreetAddress || '',
      city: formData.propertyCity || '',
      state: formData.propertyState || '',
      zipCode: formData.propertyZipCode || '',
      createdAt: new Date().toISOString(),
      status: 'Interested'
    }] : [];
    
    onAdd({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      propertiesOfInterest: propertyInterest
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return React.createElement('div', { 
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    onClick: onClose
  },
    React.createElement('div', { 
      className: 'bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto',
      onClick: (e) => e.stopPropagation()
    },
      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold text-white' }, 'Add New Client'),
        React.createElement('button', {
          onClick: onClose,
          className: 'text-gray-400 hover:text-white text-2xl'
        }, '×')
      ),
      
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-6' },
        
        // Basic Information Section
        React.createElement('div', { className: 'bg-gray-700 rounded-lg p-5' },
          React.createElement('div', { className: 'flex items-center mb-4' },
            React.createElement('span', { className: 'text-2xl mr-2' }, '📋'),
            React.createElement('h3', { className: 'text-lg font-semibold text-green-400' }, 'Basic Information')
          ),
          React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-4' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'First Name *',
              value: formData.firstName,
              onChange: (e) => handleChange('firstName', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400',
              required: true
            }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Last Name *',
              value: formData.lastName,
              onChange: (e) => handleChange('lastName', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400',
              required: true
            })
          ),
          React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
            React.createElement('input', {
              type: 'email',
              placeholder: 'Email Address *',
              value: formData.email,
              onChange: (e) => handleChange('email', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400',
              required: true
            }),
            React.createElement('input', {
              type: 'tel',
              placeholder: 'Phone Number',
              value: formData.phone,
              onChange: (e) => handleChange('phone', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400'
            })
          )
        ),
        
        // Current Address Section
        React.createElement('div', { className: 'bg-gray-700 rounded-lg p-5' },
          React.createElement('div', { className: 'flex items-center mb-4' },
            React.createElement('span', { className: 'text-2xl mr-2' }, '🏠'),
            React.createElement('h3', { className: 'text-lg font-semibold text-blue-400' }, 'Current Address')
          ),
          React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-4' },
            React.createElement('select', {
              value: formData.country,
              onChange: (e) => handleChange('country', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white'
            },
              React.createElement('option', { value: 'United States' }, 'United States'),
              React.createElement('option', { value: 'Canada' }, 'Canada'),
              React.createElement('option', { value: 'United Kingdom' }, 'United Kingdom'),
              React.createElement('option', { value: 'Australia' }, 'Australia')
            ),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Street Address',
              value: formData.address,
              onChange: (e) => handleChange('address', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400'
            })
          ),
          React.createElement('div', { className: 'grid grid-cols-3 gap-4' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'City',
              value: formData.city,
              onChange: (e) => handleChange('city', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400'
            }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'State/Province',
              value: formData.state,
              onChange: (e) => handleChange('state', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400'
            }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Zip/Postal Code',
              value: formData.zipCode,
              onChange: (e) => handleChange('zipCode', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400'
            })
          )
        ),

        // Property Interest Section with MLS Search
        React.createElement('div', { className: 'bg-slate-700 rounded-lg p-5' },
          React.createElement('div', { className: 'flex items-center justify-between mb-4' },
            React.createElement('div', { className: 'flex items-center' },
              React.createElement('span', { className: 'text-2xl mr-2' }, '🎯'),
              React.createElement('h3', { className: 'text-lg font-semibold text-purple-400' }, 'Property Interest')
            ),
            React.createElement('button', {
              type: 'button',
              onClick: async () => {
                try {
                  // Build search criteria from form fields
                  const searchCriteria = {};
                  
                  if (formData.propertyStreetAddress) {
                    searchCriteria.address = formData.propertyStreetAddress;
                  }
                  if (formData.propertyCity) {
                    searchCriteria.city = formData.propertyCity;
                  }
                  if (formData.propertyState) {
                    searchCriteria.state = formData.propertyState;
                  }
                  if (formData.propertyZipCode) {
                    searchCriteria.zipCode = formData.propertyZipCode;
                  }
                  
                  console.log('🔍 Searching MLS properties with criteria:', searchCriteria);
                  const properties = await API.bridge.searchProperties(searchCriteria);
                  console.log('🏠 Found properties:', properties);
                  
                  if (properties.length > 0) {
                    let propertyOptions = properties.slice(0, 5).map((prop, index) => 
                      `${index + 1}. ${prop.address} - $${prop.price?.toLocaleString() || 'N/A'} (${prop.bedrooms || 0}br/${prop.bathrooms || 0}ba)`
                    ).join('\\n');
                    
                    const selection = prompt(`Found ${properties.length} MLS properties! Select one:\\n\\n${propertyOptions}\\n\\nEnter number (1-5) or 0 to cancel:`);
                    
                    if (selection && selection !== '0') {
                      const selectedIndex = parseInt(selection) - 1;
                      if (selectedIndex >= 0 && selectedIndex < properties.length) {
                        const selectedProperty = properties[selectedIndex];
                        
                        const addressParts = selectedProperty.address.split(',');
                        const streetAddress = addressParts[0]?.trim() || '';
                        const city = addressParts[1]?.trim() || '';
                        const stateZip = addressParts[2]?.trim() || '';
                        const stateParts = stateZip.split(' ');
                        const state = stateParts[0] || '';
                        const zip = stateParts[1] || '';
                        
                        handleChange('propertyStreetAddress', streetAddress);
                        handleChange('propertyCity', city);
                        handleChange('propertyState', state);
                        handleChange('propertyZipCode', zip);
                        
                        alert(`✅ Selected property: ${selectedProperty.address}\\nPrice: $${selectedProperty.price?.toLocaleString() || 'N/A'}\\nBedrooms: ${selectedProperty.bedrooms || 'N/A'}\\nBathrooms: ${selectedProperty.bathrooms || 'N/A'}`);
                      }
                    }
                  } else {
                    alert('No MLS properties found. Try different search criteria or check console for details.');
                  }
                } catch (error) {
                  console.error('MLS Search Error:', error);
                  alert('❌ Error searching MLS properties. Check console for details.');
                }
              },
              className: 'px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2'
            }, 
              React.createElement('span', null, '🔍'),
              React.createElement('span', null, 'Search MLS')
            )
          ),
          React.createElement('div', { className: 'mb-4' },
            React.createElement('p', { className: 'text-gray-300 text-sm mb-2' }, 'Enter details about the property your client is interested in (optional):'),
            React.createElement('p', { className: 'text-green-400 text-xs' }, '🎯 Enhanced MLS Search - Uses Street + City + State + Zip for exact property matching (no random data)')
          ),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Street Address',
            value: formData.propertyStreetAddress,
            onChange: (e) => handleChange('propertyStreetAddress', e.target.value),
            className: 'w-full p-3 bg-slate-600 rounded border border-slate-500 text-white placeholder-gray-400 mb-4'
          }),
          React.createElement('div', { className: 'grid grid-cols-3 gap-4' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'City',
              value: formData.propertyCity,
              onChange: (e) => handleChange('propertyCity', e.target.value),
              className: 'p-3 bg-slate-600 rounded border border-slate-500 text-white placeholder-gray-400'
            }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'State/Province',
              value: formData.propertyState,
              onChange: (e) => handleChange('propertyState', e.target.value),
              className: 'p-3 bg-slate-600 rounded border border-slate-500 text-white placeholder-gray-400'
            }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Zip/Postal Code',
              value: formData.propertyZipCode,
              onChange: (e) => handleChange('propertyZipCode', e.target.value),
              className: 'p-3 bg-slate-600 rounded border border-slate-500 text-white placeholder-gray-400'
            })
          )
        ),

        // Personal Information Section
        React.createElement('div', { className: 'bg-gray-700 rounded-lg p-5' },
          React.createElement('div', { className: 'flex items-center mb-4' },
            React.createElement('span', { className: 'text-2xl mr-2' }, '👥'),
            React.createElement('h3', { className: 'text-lg font-semibold text-yellow-400' }, 'Personal Information')
          ),
          React.createElement('div', { className: 'grid grid-cols-3 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-300 mb-2' }, 'Birth Date'),
              React.createElement('input', {
                type: 'date',
                value: formData.birthday,
                onChange: (e) => handleChange('birthday', e.target.value),
                className: 'w-full p-3 bg-gray-600 rounded border border-gray-500 text-white'
              })
            ),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Spouse/Partner Name',
              value: formData.spouse,
              onChange: (e) => handleChange('spouse', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400'
            }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Children (e.g., Emma 12, Jake 8)',
              value: formData.children,
              onChange: (e) => handleChange('children', e.target.value),
              className: 'p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400'
            })
          )
        ),

        // CRM Information Section
        React.createElement('div', { className: 'bg-gray-700 rounded-lg p-5' },
          React.createElement('div', { className: 'flex items-center mb-4' },
            React.createElement('span', { className: 'text-2xl mr-2' }, '📊'),
            React.createElement('h3', { className: 'text-lg font-semibold text-orange-400' }, 'CRM Information')
          ),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Tags (comma-separated, e.g., VIP, Luxury, First-time buyer)',
            value: formData.tags,
            onChange: (e) => handleChange('tags', e.target.value),
            className: 'w-full p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400 mb-4'
          }),
          React.createElement('textarea', {
            placeholder: 'Additional Comments/Notes',
            value: formData.notes,
            onChange: (e) => handleChange('notes', e.target.value),
            rows: 3,
            className: 'w-full p-3 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400'
          })
        ),
        
        // Action Buttons
        React.createElement('div', { className: 'flex space-x-4 pt-6 border-t border-gray-600' },
          React.createElement('button', {
            type: 'submit',
            className: 'flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg'
          }, '✅ Create Client'),
          React.createElement('button', {
            type: 'button',
            onClick: onClose,
            className: 'flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors text-lg'
          }, '❌ Cancel')
        )
      )
    )
  );
}