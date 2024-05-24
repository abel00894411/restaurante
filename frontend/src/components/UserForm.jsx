import { useEffect, useState } from 'react';
import fetchAPI from '../util/fetchAPI';
import './UserForm.css';
import devLog from '../util/devLog';
import { menu } from '../models/Menu';

const UserForm = ({ userId, exclude = [], newUser = false }) => {
    if (userId && newUser) {
        devLog('Error: UserForm has userId and newUser == true');
        return <>...</>
    }

    const [userData, setUserData] = useState(undefined);

    const fields = {
        name: true,
        lastName: true,
        rfc: true,
        salary: true,
        userType: true,
        password: true,
        hiringDate: true,
        category: true
    };

    for (const field in fields) {
        if (exclude?.includes(field)) {
            fields[field] = false;
        }
    }

    useEffect(() => {
        fetchAPI(`usuario/${userId}`)
            .then(res => {
                setUserData({
                    ...res.usuario,
                    categorias: [ menu.getAllCategories()[0].categoria ], // TODO: Current categories for cook users should be obtained from the backend
                    password: '',
                    confirmPassword: ''
                });
            })
            .catch(error => {
                alert('No fue posible obtener los datos del usuario');
            });
    }, []);

    if (!userData) {
        return (
            <>Cargando...</>
        );
    }

    const handleChange = (event) => {
        const input = event.target;
        
        // Special case for categorias because currently it is an array with
        // the category name
        if (input.name == 'categorias') {
            setUserData(oldData => {
                return {
                    ...oldData,
                    'categorias': [input.value]
                }
            });

            return;
        }

        setUserData(oldData => {
            return {
                ...oldData,
                [input.name]: input.value
            }
        });
    }

    const submit = () => {
        const { password, confirmPassword } = userData;
        console.log(userData);
        if (password && (password != confirmPassword)) {
            alert(`Las contraseñas no coinciden`);
            return;
        }
        
        // FIX: When trying to update both user data and password, only the password is updated and no error is shown.

        // NOTE:
        // Non-admin users can only change their password
        // and admin users cannot change other user's passwords, and need a PATCH request to change theirs

        if (password) {
            fetchAPI(`usuario/${userId}`, 'PATCH', {
                password: password
            })
            .then(res => {
                alert('Contraseña actualizada con éxito');
            })
            .catch(error => {
                alert('No fue posible cambiar la contraseña');
                devLog(`PATCH (update password): ${error.message}`);
            });
        }

        const updateUserBody = {
            nombre: userData.nombre,
            apellido: userData.apellido,
            rfc: userData.rfc,
            sueldo: userData.sueldo,
            categorias: userData?.categorias
        };
        
        fetchAPI(`usuario/${userId}`, 'PUT', updateUserBody)
            .then(res => {
                alert('Usuario actualizado con éxito');
            })
            .catch(error => {
                alert('No fue posible actualizar los datos');
                devLog(`PUT (update data): ${error.message}`)
            });

    }

    const logout = () => {
        localStorage.removeItem('token');
        location.assign('/');
    }

    return (
        <form className='userForm'>
            
            { fields.userType && <h5 className='userForm__userType'>{userData.puesto}</h5> }

            { fields.hiringDate && <p>Contratado el {userData.fechaContratacion}</p> }

            <div className="userForm__fields">
                { fields.name && (
                    <label>
                        Nombre
                        <input autoComplete="off" type="text" name="nombre" value={userData.nombre} onChange={handleChange}/>
                    </label>
                )}

                { fields.lastName && (
                    <label>
                        Apellidos
                        <input autoComplete="off" type="text" name="apellido" value={userData.apellido} onChange={handleChange}/>
                    </label>
                )}

                { fields.rfc && (
                    <label>
                        RFC
                        <input autoComplete="off" type="text" name="rfc" value={userData.rfc} onChange={handleChange}/>
                    </label>
                )}

                { fields.salary && (
                    <label>
                        Sueldo
                        <input autoComplete="off" type="text" name="sueldo" value={userData.sueldo} onChange={handleChange}/>
                    </label>
                )}

                { fields.category && userData.puesto == 'COCINERO' && (
                    <label>
                        Categoría de cocinero
                        <select name="categorias" value={userData.categorias[0]} onChange={handleChange}>
                            {menu.getAllCategories().map((cat, i) => {
                                return (
                                    <option key={i} value={cat.categoria}>
                                        {cat.categoria}
                                    </option>
                                );
                                }
                            )}
                        </select>
                    </label>
                )}
            </div>

            { fields.password && (
                <>
                    <h5>Contraseña</h5>
                    <div className="userForm__fields">
                        <label>
                            Nueva contraseña
                            <input autoComplete="off" type="password" name="password" value={userData.password} onChange={handleChange}/>
                        </label>
                        <label>
                            Repite la nueva contraseña
                            <input autoComplete="off" type="password" name="confirmPassword" value={userData.confirmPassword} onChange={handleChange}/>
                        </label>
                    </div>
                </>
            )}

            <button type='button' onClick={submit}>{ newUser ? 'Crear usuario' : 'Guardar cambios' }</button>
            <a className='logout-link' onClick={logout}>Cerrar sesión</a>

        </form>
    );
};

export default UserForm;