using Core.Application.Abstractions.Common;
using Core.Application.Contracts.System.File;
using Core.Domain.Entities.System;
using Microsoft.AspNetCore.Http;

namespace Core.Application.Abstractions.Services.System;

public interface IFileService : IGenericService<FileStorage, int>
{
    /// <summary>
    ///     Uploads a file to storage
    /// </summary>
    Task<FileDto> UploadFileAsync(FileUploadDto fileDto);

    /// <summary>
    ///     Uploads multiple files to storage
    /// </summary>
    Task<List<FileDto>> UploadMultipleFilesAsync(IFormFileCollection files, FileUploadDto fileDto);

    /// <summary>
    ///     Gets file by reference ID and type
    /// </summary>
    Task<List<FileDto>> GetFilesByReferenceAsync(string referenceId, string referenceType);

    /// <summary>
    ///     Deletes a file
    /// </summary>
    Task<bool> DeleteFileAsync(int id);

    /// <summary>
    ///     Gets file as stream
    /// </summary>
    Task<(Stream FileStream, string ContentType, string FileName)> GetFileStreamAsync(int id);
    /// <summary>
    ///     Deletes a file by its path
    /// </summary>
    Task<bool> DeleteFileByPathAsync(string filePath);
    /// <summary>
    ///     Deletes a file by reference object
    /// </summary>
    Task<bool> DeleteFileByReference(string referenceType, string referenceId);
    /// <summary>
    ///     Update fiel's reference info
    /// </summary>
    Task<bool> UpdateFileRefenrenceAsync(FileUpdateRefenrenceDto dto);
}