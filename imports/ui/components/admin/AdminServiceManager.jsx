import React, { useState, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Services } from '../../../api/services/services';
import { Meteor } from 'meteor/meteor';

const weekdays = [
  { label: 'Domingo', value: 0, abbr: 'Dom' },
  { label: 'Segunda', value: 1, abbr: 'Seg' },
  { label: 'Terça', value: 2, abbr: 'Ter' },
  { label: 'Quarta', value: 3, abbr: 'Qua' },
  { label: 'Quinta', value: 4, abbr: 'Qui' },
  { label: 'Sexta', value: 5, abbr: 'Sex' },
  { label: 'Sábado', value: 6, abbr: 'Sáb' },
];

export const AdminServiceManager = () => {
  const [newService, setNewService] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    allowedWeekdays: [],
    category: 'other',
    price: null,
  });

  const [editingId, setEditingId] = useState(null);

  const services = useTracker(() => {
    Meteor.subscribe('services');
    return Services.find().fetch();
  });

  const toggleWeekday = useCallback((weekdaysArray, value) => {
    return weekdaysArray.includes(value)
      ? weekdaysArray.filter(d => d !== value)
      : [...weekdaysArray, value];
  }, []);

  const handleNewServiceChange = useCallback((field, value) => {
    setNewService(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditChange = useCallback(
    (id, field, value) => {
      const updatedServices = services.map(s =>
        s._id === id ? { ...s, [field]: value } : s
      );
      return updatedServices.find(s => s._id === id);
    },
    [services]
  );

  const handleCreate = useCallback(() => {
    if (!newService.name.trim()) {
      alert('Por favor, informe o nome do serviço.');
      return;
    }
    if (newService.allowedWeekdays.length === 0) {
      alert('Por favor, selecione pelo menos um dia permitido.');
      return;
    }

    Meteor.call(
      'services.insert',
      {
        name: newService.name,
        startTime: newService.startTime,
        endTime: newService.endTime,
        allowedWeekdays: newService.allowedWeekdays,
        category: newService.category,
        price: newService.price,
      },
      err => {
        if (!err) {
          setNewService({
            name: '',
            startTime: '09:00',
            endTime: '18:00',
            allowedWeekdays: [],
            category: 'other',
            price: null,
          });
        } else {
          alert(`Erro ao adicionar serviço: ${err.reason}`);
        }
      }
    );
  }, [newService]);

  const handleUpdate = useCallback(
    id => {
      const service = services.find(s => s._id === id);
      if (!service.name.trim()) {
        alert('Por favor, informe o nome do serviço.');
        return;
      }
      if (service.allowedWeekdays?.length === 0) {
        alert('Por favor, selecione pelo menos um dia permitido.');
        return;
      }

      Meteor.call(
        'services.update',
        id,
        {
          name: service.name,
          startTime: service.startTime,
          endTime: service.endTime,
          allowedWeekdays: service.allowedWeekdays || [],
          category: service.category,
          price: service.price,
        },
        err => {
          if (!err) setEditingId(null);
          else alert(`Erro ao atualizar serviço: ${err.reason}`);
        }
      );
    },
    [services]
  );

  const handleDelete = useCallback(id => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    Meteor.call('services.remove', id, err => {
      if (err) alert(`Erro ao excluir serviço: ${err.reason}`);
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Gerenciar Serviços
      </h2>

      {/* New service form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-3">
          Adicionar Novo Serviço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nome do Serviço
            </label>
            <input
              value={newService.name}
              onChange={e => handleNewServiceChange('name', e.target.value)}
              placeholder="Nome do serviço"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue focus:border-blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Categoria
              </label>
              <select
                value={newService.category}
                onChange={e =>
                  handleNewServiceChange('category', e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue focus:border-blue"
              >
                <option value="medical">Consulta Médica</option>
                <option value="exam">Exame</option>
                <option value="therapy">Terapia</option>
                <option value="other">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newService.price ?? ''}
                onChange={e =>
                  handleNewServiceChange(
                    'price',
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue focus:border-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Horário Início
              </label>
              <input
                type="time"
                value={newService.startTime}
                onChange={e =>
                  handleNewServiceChange('startTime', e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Horário Fim
              </label>
              <input
                type="time"
                value={newService.endTime}
                onChange={e =>
                  handleNewServiceChange('endTime', e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Dias Permitidos
          </label>
          <div className="flex flex-wrap gap-3">
            {weekdays.map(({ label, value }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newService.allowedWeekdays.includes(value)}
                  onChange={() =>
                    handleNewServiceChange(
                      'allowedWeekdays',
                      toggleWeekday(newService.allowedWeekdays, value)
                    )
                  }
                  className="h-4 w-4 text-blue rounded border-gray-300 focus:ring-blue"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="w-full md:w-auto px-4 py-2 bg-blue text-white rounded-md hover:bg-dark-blue transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2"
        >
          Adicionar Serviço
        </button>
      </div>

      {/* Services list */}
      <div>
        <h3 className="font-medium text-gray-700 mb-3">Serviços Cadastrados</h3>

        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum serviço cadastrado
          </p>
        ) : (
          <div className="space-y-4">
            {services.map(service => (
              <ServiceItem
                key={service._id}
                service={service}
                isEditing={editingId === service._id}
                onEditToggle={() =>
                  setEditingId(editingId === service._id ? null : service._id)
                }
                onFieldChange={(field, value) =>
                  handleEditChange(service._id, field, value)
                }
                onWeekdayToggle={value =>
                  handleEditChange(
                    service._id,
                    'allowedWeekdays',
                    toggleWeekday(service.allowedWeekdays || [], value)
                  )
                }
                onSave={() => handleUpdate(service._id)}
                onDelete={() => handleDelete(service._id)}
                weekdays={weekdays}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ServiceItem = ({
  service,
  isEditing,
  onEditToggle,
  onFieldChange,
  onWeekdayToggle,
  onSave,
  onDelete,
  weekdays,
}) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nome
              </label>
              <input
                value={service.name}
                onChange={e => onFieldChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue focus:border-blue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Categoria
                </label>
                <select
                  value={service.category}
                  onChange={e => onFieldChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue focus:border-blue"
                >
                  <option value="medical">Consulta Médica</option>
                  <option value="exam">Exame</option>
                  <option value="therapy">Terapia</option>
                  <option value="other">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={service.price ?? ''}
                  onChange={e =>
                    onFieldChange(
                      'price',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue focus:border-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Início
                </label>
                <input
                  type="time"
                  value={service.startTime || '09:00'}
                  onChange={e => onFieldChange('startTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Fim
                </label>
                <input
                  type="time"
                  value={service.endTime || '18:00'}
                  onChange={e => onFieldChange('endTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Dias Permitidos
            </label>
            <div className="flex flex-wrap gap-2">
              {weekdays.map(({ label, value }) => (
                <label key={value} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={(service.allowedWeekdays || []).includes(value)}
                    onChange={() => onWeekdayToggle(value)}
                    className="h-4 w-4 text-blue rounded border-gray-300 focus:ring-blue"
                  />
                  <span className="ml-1 text-xs text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onSave}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Salvar
            </button>
            <button
              onClick={onEditToggle}
              className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{service.name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              Categoria:{' '}
              {
                {
                  medical: 'Consulta Médica',
                  exam: 'Exame',
                  therapy: 'Terapia',
                  other: 'Outros',
                }[service.category]
              }{' '}
              | Preço:{' '}
              {service.price ? `R$ ${service.price.toFixed(2)}` : 'A consultar'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Horário: {service.startTime || '09:00'} -{' '}
              {service.endTime || '18:00'}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {service.allowedWeekdays?.length > 0 ? (
                service.allowedWeekdays.map(day => {
                  const weekday = weekdays.find(d => d.value === day);
                  return (
                    <span
                      key={day}
                      className="inline-block px-2 py-0.5 bg-light-blue text-dark-blue text-xs rounded-full"
                    >
                      {weekday?.abbr}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-gray-500">Todos os dias</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onEditToggle}
              className="px-3 py-1.5 bg-blue text-white rounded-md hover:bg-dark-blue"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 bg-light-red text-red rounded-md hover:bg-red hover:text-white"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
