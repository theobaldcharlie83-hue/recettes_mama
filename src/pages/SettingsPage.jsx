import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, Settings as SettingsIcon, Download, Upload, Check, AlertTriangle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function SettingsPage() {
    const { exportBackup, importBackup } = useContext(AppContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [pendingImport, setPendingImport] = useState(null);
    const [importError, setImportError] = useState(null);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);

    const handleExport = () => {
        const data = exportBackup();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `recettes-mama-sauvegarde-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 2000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportError(null);
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                if (!data || typeof data !== 'object') throw new Error('invalid');
                setPendingImport(data);
            } catch {
                setImportError("Ce fichier n'est pas une sauvegarde valide.");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const confirmImport = () => {
        importBackup(pendingImport);
        setPendingImport(null);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 2000);
    };

    return (
        <div className="animate-fade-in pb-8">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="font-serif text-2xl font-bold text-orange-900 dark:text-orange-50 flex items-center gap-2">
                    <SettingsIcon className="text-orange-600" size={24} /> Réglages
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-800 p-5">
                <h2 className="font-serif font-bold text-gray-800 dark:text-gray-100 mb-1">Sauvegarde</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                    Exporte tes recettes personnelles, favoris et liste de courses dans un fichier, pour les restaurer plus tard ou sur un autre appareil.
                </p>

                <button
                    onClick={handleExport}
                    className={`w-full mb-3 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${exportSuccess
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                >
                    {exportSuccess ? <Check size={16} /> : <Download size={16} />}
                    {exportSuccess ? 'Exporté !' : 'Exporter mes données'}
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all active:scale-95 ${importSuccess
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900'
                        : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-gray-800 dark:text-orange-400 dark:border-gray-700 hover:bg-orange-100 dark:hover:bg-gray-700'
                        }`}
                >
                    {importSuccess ? <Check size={16} /> : <Upload size={16} />}
                    {importSuccess ? 'Importé !' : 'Importer une sauvegarde'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {importError && (
                    <p className="mt-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle size={14} /> {importError}
                    </p>
                )}
            </div>

            <ConfirmModal
                open={!!pendingImport}
                title="Restaurer cette sauvegarde ?"
                message="Tes recettes personnelles, favoris et liste de courses actuels seront remplacés par le contenu du fichier importé."
                confirmLabel="Restaurer"
                variant="danger"
                onConfirm={confirmImport}
                onCancel={() => setPendingImport(null)}
            />
        </div>
    );
}
