import React, { useState, useRef } from 'react';
import { Form, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLink, FiUpload, FiX } from 'react-icons/fi';

const ImageUpload = ({ images = [], onChange, maxImages = 5 }) => {
  const [imageList, setImageList] = useState(images);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageList.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const newImages = [...imageList, base64String];
        setImageList(newImages);
        onChange(newImages);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUrlAdd = (url) => {
    if (!url.trim()) return;
    
    if (imageList.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = [...imageList, url.trim()];
    setImageList(newImages);
    onChange(newImages);
  };

  const handleRemoveImage = (index) => {
    const newImages = imageList.filter((_, i) => i !== index);
    setImageList(newImages);
    onChange(newImages);
  };

  const handleUrlInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlAdd(e.target.value);
      e.target.value = '';
    }
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>
          Product Images <span className="text-danger">*</span>
        </Form.Label>
        
        {/* Upload Method Toggle */}
        <div className="d-flex gap-2 mb-3">
          <Button
            variant={uploadMethod === 'url' ? 'dark' : 'outline-dark'}
            size="sm"
            onClick={() => setUploadMethod('url')}
          >
            <FiLink className="me-1" /> Use URL
          </Button>
          <Button
            variant={uploadMethod === 'file' ? 'dark' : 'outline-dark'}
            size="sm"
            onClick={() => setUploadMethod('file')}
          >
            <FiUpload className="me-1" /> Upload File
          </Button>
        </div>

        {/* URL Input */}
        {uploadMethod === 'url' && (
          <div className="mb-3">
            <Form.Control
              type="url"
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              onKeyPress={handleUrlInput}
              style={{ marginBottom: '10px' }}
            />
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                handleUrlAdd(input.value);
                input.value = '';
              }}
            >
              Add URL
            </Button>
          </div>
        )}

        {/* File Upload */}
        {uploadMethod === 'file' && (
          <div className="mb-3">
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ marginBottom: '10px' }}
            />
            <Form.Text className="text-muted">
              Select one or more images from your computer (Max {maxImages} images)
            </Form.Text>
          </div>
        )}

        {/* Image Preview Grid */}
        <AnimatePresence>
          {imageList.length > 0 && (
            <Row className="mt-3 g-3">
              {imageList.map((image, index) => (
                <Col key={index} xs={6} md={4} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="position-relative">
                      <Card.Img
                        variant="top"
                        src={image}
                        style={{
                          height: '150px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      <Badge
                        bg="danger"
                        className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center"
                        style={{ cursor: 'pointer', width: '28px', height: '28px' }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <FiX />
                      </Badge>
                      <Card.Body className="p-2">
                        <small className="text-muted">
                          Image {index + 1}
                        </small>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </AnimatePresence>

        {imageList.length === 0 && (
          <div className="text-center py-4 border rounded bg-light">
            <p className="text-muted mb-0">No images added yet</p>
            <small className="text-muted">Add images using URL or file upload</small>
          </div>
        )}

        <Form.Text className="text-muted">
          {imageList.length} / {maxImages} images added
        </Form.Text>
      </Form.Group>
    </div>
  );
};

export default ImageUpload;

